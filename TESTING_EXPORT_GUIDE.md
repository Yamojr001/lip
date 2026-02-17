# Quick Testing Guide for CSV Exports

## How to Test Each Export

### Prerequisites
1. Make sure you're logged in as the appropriate user (Admin or PHC Staff)
2. Have some test data in the database

### 1. Admin Reports Export
**URL**: `POST /admin/reports/export`
**Login Required**: Admin
**Test Method**:
```bash
# Using curl (replace with actual auth token)
curl -X POST http://your-app-url/admin/reports/export \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "report_type": "maternity",
    "start_date": "2026-01-01",
    "end_date": "2026-02-14"
  }' \
  --output test_admin_report.csv
```

**Browser Test**:
1. Navigate to Admin Dashboard → Reports
2. Select date range
3. Click "Export" button
4. CSV file should download: `maternity_report_2026_02_14.csv`

---

### 2. PHC Staff Reports Export
**URL**: `POST /phc/reports/generate`
**Login Required**: PHC Staff
**Test Method**:
```bash
# Using curl
curl -X POST http://your-app-url/phc/reports/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "start_date": "2026-01-01",
    "end_date": "2026-02-14"
  }' \
  --output test_phc_report.csv
```

**Browser Test**:
1. Login as PHC Staff
2. Navigate to PHC Dashboard → Reports
3. Select date range
4. Click "Generate Report" button
5. CSV file should download: `phc_report_2026_02_14.csv`

---

### 3. Patient Records Export
**URL**: `GET /admin/patients/export`
**Login Required**: Admin
**Test Method**:
```bash
# Using curl
curl -X GET "http://your-app-url/admin/patients/export?search=John" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output test_patients_export.csv
```

**Browser Test**:
1. Navigate to Admin Dashboard → Patients
2. Optionally filter by search term or facility
3. Click "Export" button
4. CSV file should download: `all-patients-2026-02-14.csv`

---

### 4. Nutrition Reports Export
**URL**: `GET /admin/nutrition-export`
**Login Required**: Admin
**Test Method**:
```bash
# Using curl with filters
curl -X GET "http://your-app-url/admin/nutrition-export?year=2026&month=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output test_nutrition_export.csv
```

**Browser Test**:
1. Navigate to Admin Dashboard → Nutrition Reports
2. Apply filters (LGA, Ward, PHC, Year, Month)
3. Click "Export" button
4. CSV file should download: `nutrition_reports_2026-02-14.csv`

---

### 5. Vaccine Accountability Export
**URL**: `GET /admin/vaccine-export`
**Login Required**: Admin
**Test Method**:
```bash
# Using curl with filters
curl -X GET "http://your-app-url/admin/vaccine-export?start_date=2026-01-01&end_date=2026-02-14" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output test_vaccine_export.csv
```

**Browser Test**:
1. Navigate to Admin Dashboard → Vaccine Reports
2. Apply filters (LGA, Ward, PHC, Date Range)
3. Click "Export" button
4. CSV file should download: `vaccine_reports_2026-02-14.csv`

---

## What to Check in CSV Files

### ✅ File Opens Correctly
- [ ] File opens in Excel without errors
- [ ] File opens in Google Sheets
- [ ] UTF-8 characters display correctly (é, ñ, etc.)
- [ ] No garbled text

### ✅ Headers Present
- [ ] First row contains column headers
- [ ] Headers are descriptive and clear
- [ ] No missing header cells

### ✅ Data Integrity
- [ ] All expected columns are present
- [ ] Data matches what you see in the application
- [ ] No missing rows
- [ ] Boolean values show "Yes"/"No" (not 1/0)
- [ ] Dates are properly formatted
- [ ] Numbers are not treated as text

### ✅ CSV Format
- [ ] File extension is `.csv`
- [ ] Can be opened in text editor and looks like CSV
- [ ] Fields with commas are properly quoted
- [ ] No extra blank rows at the end

---

## Common Issues & Solutions

### Issue: File won't open in Excel
**Solution**: The UTF-8 BOM should handle this, but if it doesn't, try opening with:
1. Excel: File → Import → From Text/CSV → Choose UTF-8 encoding
2. Google Sheets: Import and select "UTF-8" encoding

### Issue: Special characters are garbled
**Solution**: This shouldn't happen with BOM, but ensure your browser downloads the file correctly. Try using curl if browser has issues.

### Issue: Empty file downloaded
**Possible Causes**:
1. No data matches the filters
2. Authentication issue
3. Server error

**Solution**: Check browser console and server logs:
```bash
tail -f storage/logs/laravel.log
```

### Issue: "Method not found" error
**Solution**: Clear Laravel cache:
```bash
php artisan route:clear
php artisan cache:clear
php artisan config:clear
```

---

## Quick Verification Commands

### Check all routes exist
```bash
php artisan route:list | grep -E "(export|generate)"
```

### Check syntax
```bash
php -l app/Http/Controllers/Admin/ReportController.php
php -l app/Http/Controllers/PhcStaffController.php
php -l app/Http/Controllers/AdminController.php
php -l app/Http/Controllers/NutritionReportController.php
php -l app/Http/Controllers/Admin/AdminVaccineController.php
```

### Test controller loading
```bash
php artisan tinker
> class_exists('App\Http\Controllers\Admin\ReportController')
> class_exists('App\Http\Controllers\PhcStaffController')
```

---

## Expected CSV Structure Examples

### Maternity Report CSV (20 columns)
```
Unique ID,Woman Name,Age,Literacy Status,Phone Number,Community,Gravida,Parity,Date Registered,EDD,ANC Visits,ANC4 Completed,Place of Delivery,Delivery Outcome,Date of Delivery,PNC Completed,Health Insurance,Delivery Kit,Alert,Remark
LIP-001,Jane Doe,28,Literate,08012345678,Community A,2,1,2026-01-15,2026-08-20,4,Yes,Health Facility,Live birth,2026-08-18,Yes,Yes,Yes,,All visits completed
```

### Patient Export CSV (100+ columns)
Contains all patient fields including:
- Basic info
- ANC 1-8 detailed data (12 fields each = 96 columns)
- Delivery info
- PNC visits
- Insurance
- Family planning
- Vaccines (21 vaccines x 2 fields = 42 columns)

### Nutrition Report CSV (12 columns)
```
PHC,LGA,Ward,Year,Month,Total Screened,MAM,SAM,Oedema,RUTF Given,MNP Given,Submitted At
Primary Health Center A,LGA Name,Ward Name,2026,January,150,5,2,1,2,148,2026-02-01
```

### Vaccine Report CSV (10 columns)
```
PHC,LGA,Ward,Month/Year,Reporting Date,Total Doses Used,Total Doses Discarded,Stock Out Count,Wastage Rate (%),Status
Primary Health Center A,LGA Name,Ward Name,January 2026,2026-02-01,500,10,0,2.0,Submitted
```

---

## Performance Notes

- All exports use streaming (`streamDownload`) for memory efficiency
- Large datasets (10,000+ records) should export without memory issues
- Export time depends on dataset size and server performance
- No file size limits imposed by the code

---

**Last Updated**: 2026-02-14
**All Exports Working**: ✅ CSV Format Only
