# API Quick Reference - cURL Examples

This file contains cURL commands to test all new and enhanced features.

**Prerequisites:**
- Replace `[TOKEN]` with actual JWT token
- Replace `[ADMIN_TOKEN]` with admin JWT token
- Replace `[CUSTOMER_TOKEN]` with customer JWT token
- Replace `[ID]` with actual MongoDB ObjectId
- Replace `localhost:5000` with your actual server URL

---

## 🔐 Authentication Examples

### Register as Customer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1-234-567-8900",
    "address": "123 Main St, City, State"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## 💬 FEEDBACK - New Anonymous Feature

### Submit Anonymous Feedback
```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Great Service",
    "message": "Really happy with the property management service",
    "category": "service",
    "rating": 5,
    "isAnonymous": true
  }'
```

### Submit Named Feedback (with token)
```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -d '{
    "title": "Need Improvement",
    "message": "Response time could be faster",
    "category": "suggestion",
    "rating": 3,
    "isAnonymous": false
  }'
```

### View My Feedback
```bash
curl -X GET http://localhost:5000/api/feedback/my \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]"
```

### View All Feedback (Admin)
```bash
curl -X GET http://localhost:5000/api/feedback \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### View Specific Feedback
```bash
curl -X GET http://localhost:5000/api/feedback/[FEEDBACK_ID] \
  -H "Authorization: Bearer [TOKEN]"
```

### Update Feedback
```bash
curl -X PUT http://localhost:5000/api/feedback/[FEEDBACK_ID] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -d '{
    "title": "Updated Title",
    "message": "Updated message",
    "category": "complaint",
    "rating": 2
  }'
```

### Respond to Feedback (Admin)
```bash
curl -X PUT http://localhost:5000/api/feedback/[FEEDBACK_ID]/respond \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "adminResponse": "Thank you for your feedback. We will improve our response time."
  }'
```

### Delete Feedback
```bash
curl -X DELETE http://localhost:5000/api/feedback/[FEEDBACK_ID] \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]"
```

---

## 📄 DOCUMENTS - New Audit Trail & Filtering

### Upload Document (Admin)
```bash
curl -X POST http://localhost:5000/api/documents \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -F "document=@/path/to/file.pdf" \
  -F "title=Sale Agreement" \
  -F "type=mandatory" \
  -F "category=sale_agreement" \
  -F "property=[PROPERTY_ID]" \
  -F "customer=[CUSTOMER_ID]" \
  -F "description=Property sale agreement document"
```

### View Document (with automatic audit trail tracking)
```bash
curl -X GET http://localhost:5000/api/documents/[DOCUMENT_ID] \
  -H "Authorization: Bearer [TOKEN]"
```

### Download Document (with automatic audit trail tracking)
```bash
curl -X GET http://localhost:5000/api/documents/[DOCUMENT_ID]/download \
  -H "Authorization: Bearer [TOKEN]" \
  -o document.pdf
```

### View Document Audit Trail (Admin Only)
```bash
curl -X GET http://localhost:5000/api/documents/[DOCUMENT_ID]/audit-trail \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

**Response includes:**
- Who accessed the document
- When they accessed it
- What they did (viewed/downloaded)
- IP address and browser info

### Filter Documents by Customer Name & Property Type
```bash
curl -X GET "http://localhost:5000/api/documents/filtered/search?customerName=John&propertyType=apartment" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Filter with Additional Criteria
```bash
curl -X GET "http://localhost:5000/api/documents/filtered/search?customerName=John&propertyType=villa&category=sale_agreement&type=mandatory" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### View My Documents (Customer)
```bash
curl -X GET http://localhost:5000/api/documents/my \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]"
```

### View All Documents (Admin)
```bash
curl -X GET http://localhost:5000/api/documents \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Delete Document
```bash
curl -X DELETE http://localhost:5000/api/documents/[DOCUMENT_ID] \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

---

## 📅 MEETINGS - New Meeting Management System

### Create Meeting Request (Customer)
```bash
curl -X POST http://localhost:5000/api/meetings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -d '{
    "title": "Property Inspection",
    "description": "I want to inspect the property before purchase",
    "requestedDate": "2024-04-20",
    "preferredTime": "afternoon",
    "property": "[PROPERTY_ID]"
  }'
```

### Create with Morning Time
```bash
curl -X POST http://localhost:5000/api/meetings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -d '{
    "title": "Contract Signing",
    "description": "Sign purchase contract",
    "requestedDate": "2024-04-22",
    "preferredTime": "morning",
    "property": "[PROPERTY_ID]"
  }'
```

### View My Meeting Requests (Customer)
```bash
curl -X GET http://localhost:5000/api/meetings/my \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]"
```

### View All Meetings (Admin)
```bash
curl -X GET http://localhost:5000/api/meetings \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Filter Meetings by Status (Admin)
```bash
curl -X GET "http://localhost:5000/api/meetings?status=pending" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Get Specific Meeting
```bash
curl -X GET http://localhost:5000/api/meetings/[MEETING_ID] \
  -H "Authorization: Bearer [TOKEN]"
```

### Schedule Meeting (Admin Assigns Staff & Date)
```bash
curl -X PUT http://localhost:5000/api/meetings/[MEETING_ID]/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "assignedStaffId": "[STAFF_ID]",
    "scheduledDate": "2024-04-20T14:00:00.000Z",
    "meetingLocation": "123 Main St, City - Property Address"
  }'
```

### Mark Meeting as Complete
```bash
curl -X PUT http://localhost:5000/api/meetings/[MEETING_ID]/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "notes": "Customer satisfied. Discussed property features and terms."
  }'
```

### Cancel Meeting (Customer - with reason)
```bash
curl -X PUT http://localhost:5000/api/meetings/[MEETING_ID]/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -d '{
    "cancelReason": "Schedule conflict with work"
  }'
```

### Cancel Meeting (Admin - with reason)
```bash
curl -X PUT http://localhost:5000/api/meetings/[MEETING_ID]/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "cancelReason": "Staff member unavailable"
  }'
```

### View Meetings Assigned to Staff
```bash
curl -X GET http://localhost:5000/api/meetings/staff/[STAFF_ID] \
  -H "Authorization: Bearer [TOKEN]"
```

---

## 👥 USER MANAGEMENT

### Get All Customers
```bash
curl -X GET http://localhost:5000/api/users/customers \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Search Customers
```bash
curl -X GET "http://localhost:5000/api/users/customers?search=John" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Get Customer Details
```bash
curl -X GET http://localhost:5000/api/users/customers/[CUSTOMER_ID] \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Update Customer
```bash
curl -X PUT http://localhost:5000/api/users/customers/[CUSTOMER_ID] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "name": "John Updated",
    "phone": "+1-234-567-8901",
    "address": "456 New St, City"
  }'
```

---

## 🏢 PROPERTIES

### Create Property (Admin)
```bash
curl -X POST http://localhost:5000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "title": "Luxury Villa",
    "description": "Beautiful 3-bedroom villa with garden",
    "type": "villa",
    "price": 500000,
    "location": {
      "address": "123 Prime Avenue",
      "city": "Dubai",
      "state": "Dubai",
      "zipCode": "00000",
      "country": "UAE"
    },
    "features": {
      "bedrooms": 3,
      "bathrooms": 2,
      "area": 3500,
      "parking": true,
      "furnished": true
    }
  }'
```

### Get All Properties
```bash
curl -X GET http://localhost:5000/api/properties \
  -H "Authorization: Bearer [TOKEN]"
```

### Search Properties
```bash
curl -X GET "http://localhost:5000/api/properties?search=villa&city=Dubai&minPrice=300000&maxPrice=600000" \
  -H "Authorization: Bearer [TOKEN]"
```

### Get Property Details
```bash
curl -X GET http://localhost:5000/api/properties/[PROPERTY_ID] \
  -H "Authorization: Bearer [TOKEN]"
```

### Update Property (Admin)
```bash
curl -X PUT http://localhost:5000/api/properties/[PROPERTY_ID] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "title": "Updated Title",
    "price": 550000,
    "status": "reserved"
  }'
```

### Assign Staff to Property
```bash
curl -X PUT http://localhost:5000/api/properties/[PROPERTY_ID] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "assignedStaff": ["[STAFF_ID_1]", "[STAFF_ID_2]"]
  }'
```

### Delete Property
```bash
curl -X DELETE http://localhost:5000/api/properties/[PROPERTY_ID] \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

---

## 💳 PAYMENTS

### Make Payment
```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -F "property=[PROPERTY_ID]" \
  -F "amount=50000" \
  -F "transactionReference=TXN123456" \
  -F "paymentMethod=bank_transfer" \
  -F "proof=@/path/to/proof.pdf"
```

### View My Payments
```bash
curl -X GET http://localhost:5000/api/payments/my \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]"
```

### View All Payments (Admin)
```bash
curl -X GET http://localhost:5000/api/payments \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Filter Payments (Admin)
```bash
curl -X GET "http://localhost:5000/api/payments?status=pending&startDate=2024-01-01&endDate=2024-03-31" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Verify Payment (Admin)
```bash
curl -X PUT http://localhost:5000/api/payments/[PAYMENT_ID]/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "adminRemarks": "Payment verified successfully"
  }'
```

### Reject Payment (Admin)
```bash
curl -X PUT http://localhost:5000/api/payments/[PAYMENT_ID]/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "adminRemarks": "Transaction reference not found"
  }'
```

---

## 📊 DASHBOARDS

### Admin Dashboard
```bash
curl -X GET http://localhost:5000/api/dashboard/admin \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Customer Dashboard
```bash
curl -X GET http://localhost:5000/api/dashboard/customer \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]"
```

### Financial Analytics
```bash
curl -X GET http://localhost:5000/api/dashboard/financial \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Property Analytics
```bash
curl -X GET http://localhost:5000/api/dashboard/property \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

---

## 🔗 PURCHASE REQUESTS

### Submit Purchase Request
```bash
curl -X POST http://localhost:5000/api/purchase-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -d '{
    "propertyId": "[PROPERTY_ID]",
    "notes": "Very interested. Ready to proceed immediately."
  }'
```

### View My Requests
```bash
curl -X GET http://localhost:5000/api/purchase-requests/my \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]"
```

### View All Requests (Admin)
```bash
curl -X GET http://localhost:5000/api/purchase-requests \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Approve Request
```bash
curl -X PUT http://localhost:5000/api/purchase-requests/[REQUEST_ID]/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "adminNotes": "Approved. Please proceed with documentation."
  }'
```

### Reject Request
```bash
curl -X PUT http://localhost:5000/api/purchase-requests/[REQUEST_ID]/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "adminNotes": "Property already sold to another customer."
  }'
```

---

## 🏗️ CONSTRUCTION & CHANGE REQUESTS

### Create Change Request
```bash
curl -X POST http://localhost:5000/api/change-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -d '{
    "property": "[PROPERTY_ID]",
    "type": "modification",
    "title": "Add Extra Room",
    "description": "Want to add an extra room to the property",
    "priority": "high"
  }'
```

### View My Change Requests
```bash
curl -X GET http://localhost:5000/api/change-requests/my \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]"
```

### View All Change Requests (Admin)
```bash
curl -X GET http://localhost:5000/api/change-requests \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Approve Change Request
```bash
curl -X PUT http://localhost:5000/api/change-requests/[REQUEST_ID] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "status": "approved",
    "adminNotes": "Approved. Contractor has been notified."
  }'
```

---

## 💡 TIPS

- Always include `Content-Type: application/json` header for JSON requests
- Always include token in Authorization header: `"Authorization: Bearer YOUR_TOKEN"`
- For file uploads, use `-F` instead of `-d`
- Use `?` for query parameters and `&` to separate multiple parameters
- Replace placeholders with actual values before running
- Check response for `"success": true` to validate successful requests

---

## 🧪 Testing Order

1. **Register & Login** first to get tokens
2. **Create documents** for audit trail testing
3. **View documents** (adds to audit trail)
4. **Download documents** (adds to audit trail)
5. **Check audit trail** (see all tracked accesses)
6. **Test filtering** with various parameters
7. **Test meetings** (create → schedule → complete → view)
8. **Test anonymous feedback** without token
9. **Test named feedback** with token
10. **Test everything integrates** properly

---

## 📝 Notes

- Keep tokens updated (they may expire)
- Admin token needed for sensitive operations
- Customer token needed for personal requests
- Anonymous endpoints don't need tokens
- All timestamps are in UTC ISO format
- All IDs are MongoDB ObjectIds (24 hex characters)
