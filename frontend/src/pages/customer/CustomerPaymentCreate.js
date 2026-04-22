import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPayment, getMyProperties, getMyPayments } from '../../services/dataService';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CustomerPaymentCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [proof, setProof] = useState(null);
  const [totalAmount, setTotalAmount] = useState('');
  const [pendingTermPayment, setPendingTermPayment] = useState(null); // Track if there's a pending term to pay
  const [form, setForm] = useState({
    property: searchParams.get('property') || '',
    amount: '',
    paymentMethod: 'bank_transfer',
    transactionReference: '',
    installmentOption: 'full'
  });

  // Fetch properties and payments
  useEffect(() => {
    const fetch = async () => {
      try {
        const [propsRes, paymentsRes] = await Promise.all([
          getMyProperties(),
          getMyPayments()
        ]);
        setProperties(propsRes.data.data);
        setPayments(paymentsRes.data.data);
      } catch (err) { 
        console.error(err); 
      }
      finally { 
        setLoading(false); 
      }
    };
    fetch();
  }, []);

  // When property is selected, check if they're continuing a 3x installment
  useEffect(() => {
    if (!form.property) {
      setPendingTermPayment(null);
      setTotalAmount('');
      return;
    }

    const selectedProp = properties.find(p => p._id === form.property);
    if (!selectedProp) return;

    // Find all payments for this property
    const propertyPayments = payments.filter(p => p.property._id === form.property);
    
    // Check for verified 3x installment payments
    const verified3xPayments = propertyPayments.filter(
      p => p.status === 'verified' && p.installmentOption === '3x'
    );

    if (verified3xPayments.length > 0) {
      // This is a continuing 3x installment
      const firstPayment = verified3xPayments[0]; // Get first term to access plan details
      const totalPlanAmount = firstPayment.totalInstallmentAmount; // Original total for 3x
      const termAmount = firstPayment.amount; // Each term amount (total / 3)
      const highestVerifiedTerm = Math.max(...verified3xPayments.map(p => p.installmentTerm));
      
      if (highestVerifiedTerm < 3) {
        // Calculate remaining balance and next term amount
        const amountPaidSoFar = termAmount * highestVerifiedTerm;
        const remainingBalanceForNextTerms = totalPlanAmount - amountPaidSoFar;
        const termsRemaining = 3 - highestVerifiedTerm;
        const nextTermAmount = Math.round((remainingBalanceForNextTerms / termsRemaining) * 100) / 100;
        const nextTerm = highestVerifiedTerm + 1;
        
        const simulatedPending = {
          installmentTerm: nextTerm,
          amount: nextTermAmount,
          installmentOption: '3x',
          totalPlanAmount: totalPlanAmount,
          remainingBalance: remainingBalanceForNextTerms
        };
        setPendingTermPayment(simulatedPending);
        setTotalAmount(nextTermAmount.toString());
        setForm(prev => ({
          ...prev,
          installmentOption: '3x',
          amount: nextTermAmount
        }));
      } else {
        // All terms paid
        setPendingTermPayment(null);
        const remainingBalance = selectedProp.price - (selectedProp.totalPaid || 0);
        setTotalAmount(remainingBalance.toString());
      }
    } else {
      // No previous 3x payments - allow new payment
      setPendingTermPayment(null);
      const remainingBalance = selectedProp.price - (selectedProp.totalPaid || 0);
      setTotalAmount(remainingBalance.toString());
    }
  }, [form.property, properties, payments]);

  // Auto-calculate amount when installment option or total amount changes (only if no pending term)
  useEffect(() => {
    if (pendingTermPayment) return; // Don't recalculate if paying a pending term

    if (form.installmentOption === '3x' && totalAmount) {
      const termAmount = Math.round((totalAmount / 3) * 100) / 100;
      setForm(prev => ({ ...prev, amount: termAmount }));
    } else if (form.installmentOption === 'full') {
      setForm(prev => ({ ...prev, amount: totalAmount }));
    }
  }, [form.installmentOption, totalAmount, pendingTermPayment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = new FormData();
      data.append('property', form.property);
      data.append('paymentMethod', form.paymentMethod);
      data.append('installmentOption', form.installmentOption);
      data.append('amount', totalAmount);
      if (form.transactionReference) data.append('transactionReference', form.transactionReference);
      if (proof) data.append('proof', proof);
      
      console.log('Submitting payment with:',  {
        property: form.property,
        installmentOption: form.installmentOption,
        amount: totalAmount,
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference,
        isPendingTerm: !!pendingTermPayment
      });
      
      await createPayment(data);
      navigate('/customer/payments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit payment');
    } finally { setSubmitting(false); }
  };

  const selectedProp = properties.find(p => p._id === form.property);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header"><h1>Make Payment</h1></div>
      <div className="card" style={{ maxWidth: '600px' }}>
        {error && <div className="alert alert-danger">{error}</div>}
        
        {pendingTermPayment && (
          <div className="alert alert-info" style={{ marginBottom: '16px', borderColor: '#2196F3', backgroundColor: '#e3f2fd' }}>
            <p><strong>ℹ️ Continue Installment Payment</strong></p>
            <p>You have a continuing <strong>3x Installment Plan</strong> for this property.</p>
            <p><strong>Ready to pay Term {pendingTermPayment.installmentTerm}/3</strong></p>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
              Remaining Balance: {formatCurrency(pendingTermPayment.remainingBalance)} ÷ {3 - pendingTermPayment.installmentTerm + 1} remaining terms = {formatCurrency(pendingTermPayment.amount)}
            </p>
            <p style={{ marginBottom: 0, fontSize: '0.9em', color: '#666' }}>Pay when ready. You can make the next payment whenever you want.</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Property *</label>
            <select 
              className="form-control" 
              value={form.property} 
              onChange={(e) => setForm({ ...form, property: e.target.value })} 
              required
            >
              <option value="">Select Property</option>
              {properties.map(p => (
                <option key={p._id} value={p._id}>
                  {p.title} - {formatCurrency(p.price)} (Paid: {p.paymentPercentage || 0}%)
                </option>
              ))}
            </select>
          </div>

          {selectedProp && (
            <div className="alert alert-info" style={{ marginBottom: '16px' }}>
              <p>Property Price: {formatCurrency(selectedProp.price)}</p>
              <p>Total Paid: {formatCurrency(selectedProp.totalPaid || 0)}</p>
              <p>Remaining: {formatCurrency(selectedProp.price - (selectedProp.totalPaid || 0))}</p>
            </div>
          )}

          {!pendingTermPayment && (
            <div className="form-group">
              <label>Payment Plan *</label>
              <select className="form-control" value={form.installmentOption} onChange={(e) => setForm({ ...form, installmentOption: e.target.value })}>
                <option value="full">Full Payment</option>
                <option value="3x">3x Installment (Pay in 3 Terms)</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>
              {pendingTermPayment 
                ? `Term ${pendingTermPayment.installmentTerm}/3 Payment Amount (ReadOnly)` 
                : form.installmentOption === '3x' 
                  ? 'Total Remaining Amount (for 3 Terms)' 
                  : 'Amount *'
              }
            </label>
            <input 
              type="number" 
              className="form-control" 
              value={totalAmount} 
              onChange={(e) => !pendingTermPayment && form.installmentOption === 'full' ? setTotalAmount(e.target.value) : null}
              placeholder={form.installmentOption === '3x' && !pendingTermPayment ? 'Auto-calculated from remaining balance' : 'Enter payment amount'}
              readOnly={form.installmentOption === '3x' || !!pendingTermPayment}
              style={(form.installmentOption === '3x' || !!pendingTermPayment) ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
              required 
              min="1" 
            />
            {(form.installmentOption === '3x' || pendingTermPayment) && (
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                {pendingTermPayment 
                  ? 'This is your pending term payment amount' 
                  : 'Auto-calculated from your remaining balance on this property'
                }
              </small>
            )}
          </div>

          {form.installmentOption === '3x' && !pendingTermPayment && (
            <>
              <div className="form-group">
                <label>Term 1 Payment Amount (Auto Calculated - ReadOnly)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={form.amount} 
                  readOnly 
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Calculated as 1/3 of the remaining balance
                </small>
              </div>

              <div className="alert alert-info" style={{ marginBottom: '16px' }}>
                <p><strong>Installment Plan Breakdown:</strong></p>
                {totalAmount && form.amount ? (
                  <>
                    <p>Term 1 Payment: {formatCurrency(form.amount)}</p>
                    <p>Term 2 Payment: {formatCurrency(form.amount)}</p>
                    <p>Term 3 Payment: {formatCurrency(form.amount)}</p>
                    <p style={{ marginTop: '8px', borderTop: '1px solid #0056b3', paddingTop: '8px' }}>
                      <strong>Total Remaining Balance: {formatCurrency(totalAmount)}</strong>
                    </p>
                    <p style={{ color: '#0056b3', marginTop: '8px' }}><strong>You will pay {formatCurrency(form.amount)} today (Term 1)</strong></p>
                  </>
                ) : (
                  <p style={{ color: '#666' }}>Select a property first to see the payment breakdown</p>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label>Payment Method *</label>
            <select className="form-control" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="credit_card">Credit Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Transaction Reference</label>
            <input type="text" className="form-control" value={form.transactionReference} onChange={(e) => setForm({ ...form, transactionReference: e.target.value })} placeholder="Enter transaction ID or reference number" />
          </div>
          <div className="form-group">
            <label>Payment Proof (Receipt/Screenshot)</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setProof(e.target.files[0])} />
          </div>
          <div className="btn-group" style={{ marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting || !form.property || !totalAmount}>{submitting ? 'Submitting...' : 'Submit Payment'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/customer/payments')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerPaymentCreate;
