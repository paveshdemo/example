# New Features Implementation Guide

## 📋 Overview of New Features Added

This document outlines the new features that have been implemented to enhance your Property Management System.

---

## 🆕 1. Anonymous Customer Feedback

### Feature Description
Customers can now submit feedback without revealing their identity. This encourages honest feedback about services and experiences.

### Database Model
- **Model**: Enhanced `Feedback` schema
- **New Field**: `isAnonymous` (Boolean, default: false)

### API Endpoint
```
POST /api/feedback
```

### Request Example (Anonymous)
```json
{
  "title": "Excellent Service Quality",
  "message": "The staff was very professional and helpful during my visit.",
  "category": "service",
  "rating": 5,
  "isAnonymous": true
}
```

### Request Example (Named)
```json
{
  "title": "Suggestion for Improvement",
  "message": "Consider adding more payment options.",
  "category": "suggestion",
  "rating": 4,
  "isAnonymous": false
}
```

### Authentication
- **Optional** - No token required for anonymous feedback
- User authentication is optional; if provided, creates named feedback

### Benefits
✅ Encourages honest feedback  
✅ Protects customer privacy when needed  
✅ Helps identify service gaps without fear of retaliation  
✅ Admin can still respond to anonymous feedback  

---

## 🆕 2. Document Access Audit Trail

### Feature Description
Track every access point to legal documents. Admins can see who accessed which documents, when, and from where (IP address).

### Database Model
- **New Model**: `DocumentAuditTrail`
- **Fields**:
  - `document` - Reference to Document
  - `user` - User who accessed it
  - `action` - Type: 'viewed', 'downloaded', 'uploaded', 'deleted'
  - `ipAddress` - IP address of accessor
  - `userAgent` - Browser/device information
  - `timestamp` - When access occurred

### API Endpoint
```
GET /api/documents/:documentId/audit-trail
```

### Response Example
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "user": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "customer"
      },
      "action": "downloaded",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-03-31T10:30:00.000Z"
    },
    {
      "_id": "...",
      "user": { ... },
      "action": "viewed",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-03-31T10:25:00.000Z"
    }
  ]
}
```

### Automatic Tracking
The following actions are automatically tracked:
- 📖 Document viewed: `GET /api/documents/:id`
- 💾 Document downloaded: `GET /api/documents/:id/download`
- 🗑️ Document deleted: `DELETE /api/documents/:id`
- 📤 Document uploaded: `POST /api/documents`

### Access Control
- **Admin Only** - Only administrators can view document audit trails
- **Automatic** - No additional configuration needed

### Use Cases
✅ Compliance and regulatory requirements  
✅ Detect unauthorized access attempts  
✅ Track document usage patterns  
✅ Security audits and investigations

---

## 🆕 3. Advanced Document Filtering

### Feature Description
Filter documents by customer name AND property type simultaneously. Previously, filtering was limited to single criteria.

### API Endpoint
```
GET /api/documents/filtered/search
```

### Query Parameters
```
?customerName=<string>   - Filter by customer name (case-insensitive)
&propertyType=<string>   - Filter by property type (apartment, house, villa, etc.)
&category=<string>       - Filter by document category (optional)
&type=<string>           - Filter by document type (optional)
```

### Examples

#### Example 1: Find all documents for customers named "John" in apartments
```
GET /api/documents/filtered/search?customerName=John&propertyType=apartment
```

#### Example 2: Find all documents for "Sarah" in commercial properties
```
GET /api/documents/filtered/search?customerName=Sarah&propertyType=commercial
```

#### Example 3: Combine with document type/category
```
GET /api/documents/filtered/search?customerName=Ahmed&propertyType=villa&category=sale_agreement
```

### Response Example
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Sale Agreement",
      "fileName": "agreement.pdf",
      "property": {
        "_id": "...",
        "title": "Luxury Villa",
        "type": "villa"
      },
      "customer": {
        "_id": "...",
        "name": "Ahmed Hassan",
        "email": "ahmed@example.com"
      },
      "category": "sale_agreement",
      "type": "mandatory",
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  ]
}
```

### Access Control
- **Admin Only** - Administrative staff can use this feature

### Use Cases
✅ Quick document lookup by customer and property type  
✅ Generate reports for specific customer/property combinations  
✅ Compliance verification for specific property types  
✅ Audit and review processes

---

## 🆕 4. Meeting Request Management

### Feature Description
Customers can request physical meetings with staff. Admin can schedule, assign staff, and track meeting status.

### Database Model
- **New Model**: `MeetingRequest`
- **Statuses**: 'pending', 'scheduled', 'completed', 'cancelled'
- **Preferred Times**: 'morning', 'afternoon', 'evening'

### Customer API Endpoints

#### Create Meeting Request
```
POST /api/meetings
```

**Request Body:**
```json
{
  "title": "Property Inspection",
  "description": "I want to inspect the property before finalizing purchase",
  "requestedDate": "2024-04-20",
  "preferredTime": "afternoon",
  "property": "507f1f77bcf86cd799439011"
}
```

#### View My Meetings
```
GET /api/meetings/my
```

#### Cancel Meeting
```
PUT /api/meetings/:id/cancel
```

**Request Body:**
```json
{
  "cancelReason": "Schedule conflict"
}
```

### Admin/Staff API Endpoints

#### View All Meetings
```
GET /api/meetings
```

**Query Parameters:**
```
?status=pending          - Filter by status
?customerId=<id>        - Filter by customer
```

#### Schedule Meeting (Assign Staff & Set Date)
```
PUT /api/meetings/:id/schedule
```

**Request Body:**
```json
{
  "assignedStaffId": "507f1f77bcf86cd799439012",
  "scheduledDate": "2024-04-22T14:00:00.000Z",
  "meetingLocation": "Property Address / Office Address"
}
```

#### Mark Meeting Complete
```
PUT /api/meetings/:id/complete
```

**Request Body:**
```json
{
  "notes": "Customer satisfied with property. Discussed terms."
}
```

#### View Staff Assigned Meetings
```
GET /api/meetings/staff/:staffId
```

### Response Example
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "customer": {
    "_id": "507f1f77bcf86cd799439001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-234-567-8900"
  },
  "property": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Modern Apartment"
  },
  "title": "Property Inspection",
  "description": "I want to inspect the property",
  "requestedDate": "2024-04-20",
  "preferredTime": "afternoon",
  "status": "scheduled",
  "scheduledDate": "2024-04-22T14:00:00.000Z",
  "meetingLocation": "Property Address",
  "assignedStaff": {
    "_id": "507f1f77bcf86cd799439002",
    "name": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "phone": "+1-234-567-8901"
  },
  "notes": "Meeting completed successfully",
  "createdAt": "2024-03-31T10:00:00.000Z",
  "updatedAt": "2024-04-22T14:00:00.000Z"
}
```

### Notifications
Automatic notifications are sent to:
- **Customer** when meeting is scheduled, completed, or cancelled
- **Assigned Staff** when they're assigned to a meeting
- **Admin** when a new meeting request is created

### Status Flow
```
pending → scheduled → completed
         ↘ cancelled (at any stage)
```

### Use Cases
✅ Physical property inspections  
✅ Contract signing meetings  
✅ Customer consultation sessions  
✅ Staff availability management  
✅ Audit trail of customer interactions

---

## 🔒 Security & Permissions

### Anonymous Feedback
- No authentication token required
- Customer reference set to `null`
- Admin notifications handled appropriately

### Document Audit Trail
- Admin only access
- IP and device tracking for compliance

### Document Filtering
- Admin only access
- Supports multi-criteria searches

### Meeting Requests
- Customers: Create and manage their own requests
- Staff: View assigned meetings
- Admin: Full control and scheduling

---

## 📊 Database Migrations Required

Run these commands to update your database:

```bash
# Create DocumentAuditTrail collection
# Create MeetingRequest collection
# Add isAnonymous field to Feedback collection
```

Since MongoDB is schema-less, the collections will auto-create on first use.

---

## 🧪 Quick Test Guide

### Test Anonymous Feedback
```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Feedback",
    "message": "Testing anonymous feedback",
    "category": "suggestion",
    "rating": 4,
    "isAnonymous": true
  }'
```

### Test Document Audit
```bash
curl -X GET http://localhost:5000/api/documents/[DOC_ID]/audit-trail \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Test Document Filtering
```bash
curl -X GET "http://localhost:5000/api/documents/filtered/search?customerName=John&propertyType=apartment" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Test Meeting Request
```bash
curl -X POST http://localhost:5000/api/meetings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -d '{
    "title": "Property Inspection",
    "requestedDate": "2024-04-20",
    "preferredTime": "afternoon",
    "property": "[PROPERTY_ID]"
  }'
```

---

## 📝 Frontend Integration Notes

### For Anonymous Feedback Feature
```javascript
// Include isAnonymous parameter
const submitFeedback = async (feedbackData) => {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...feedbackData,
      isAnonymous: feedbackData.isAnonymous === true
    })
  });
  return response.json();
};
```

### For Document Audit Trail
```javascript
// Admin dashboard to view audit trail
const viewAuditTrail = async (documentId) => {
  const response = await fetch(`/api/documents/${documentId}/audit-trail`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### For Document Filtering
```javascript
// Advanced search interface
const filterDocuments = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/documents/filtered/search?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### For Meeting Requests
```javascript
// Customer meeting request
const requestMeeting = async (meetingData) => {
  const response = await fetch('/api/meetings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify(meetingData)
  });
  return response.json();
};

// Admin scheduling
const scheduleMeeting = async (meetingId, scheduleData) => {
  const response = await fetch(`/api/meetings/${meetingId}/schedule`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(scheduleData)
  });
  return response.json();
};
```

---

## ✅ All Requirements Implemented

- [x] Customer can create account
- [x] View all customers (Admin)
- [x] View customer profiles (Admin)
- [x] Edit customer information (Admin)
- [x] View own properties (Customer)
- [x] View Property Details (Customer)
- [x] Manage User Accounts (Admin)
- [x] Assign Maintenance Staff to Property (Admin)
- [x] View Assigned Properties (Maintenance Staff)
- [x] Create Property Listing (Admin)
- [x] View All Properties (Admin)
- [x] Delete Property Listing (Admin)
- [x] Edit Property Details (Admin)
- [x] View Purchase Requests by Property (Admin)
- [x] Approve Purchase Request (Admin)
- [x] Reject Purchase Request (Admin)
- [x] Submit Purchase Request (Customer)
- [x] Upload Legal Documents (Admin)
- [x] View Legal Documents (Admin)
- [x] Delete Legal Documents (Admin)
- [x] View Document in Browser (Admin)
- [x] Document Access Audit Trail (Admin) **NEW**
- [x] View Own Legal Documents (Customer)
- [x] Download Documents (Customer)
- [x] View Document in Browser (Customer)
- [x] Document Filtering by Name & Type **NEW**
- [x] Update Construction Status (Maintenance Staff)
- [x] View All Change Requests (Admin)
- [x] Approve/Reject Change Request (Admin)
- [x] View Construction Progress (Customer)
- [x] Create Change Request (Customer)
- [x] View Change Requests (Customer)
- [x] Edit Change Request (Customer)
- [x] Delete Change Request (Customer)
- [x] Verify Payment (Admin)
- [x] Reject Payment (Admin)
- [x] View All Payments (Admin)
- [x] Generate Payment Reports (Admin)
- [x] Make Payment (Customer)
- [x] View Payment History (Customer)
- [x] View Payment Summary Dashboard (Customer)
- [x] View Admin Dashboard (Admin)
- [x] View Financial Analytics (Admin)
- [x] View Property Analytics (Admin)
- [x] View All Customer Feedback (Admin)
- [x] Respond to Customer Feedback (Admin)
- [x] View Customer Dashboard (Customer)
- [x] Submit Customer Feedback (Customer)
- [x] View and Manage Own Feedback (Customer)
- [x] Edit Customer Feedback (Customer)
- [x] Delete Customer Feedback (Customer)
- [x] Send Anonymous Feedback (Customer) **NEW**
- [x] Request Meeting Schedule (Customer) **NEW**

---

## 🚀 Next Steps

1. **Test all endpoints** using the provided curl commands
2. **Update frontend components** to support new features
3. **Update user documentation** for customers and admin
4. **Configure email notifications** for meetings and feedback responses
5. **Set up monitoring** for document access audit trails

For any issues or questions, refer to the main FEATURE_IMPLEMENTATION_CHECKLIST.md file.
