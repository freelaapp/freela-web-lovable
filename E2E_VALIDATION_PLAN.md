# E2E Validation Plan: Provider Availability Persistence (v0.8.0)

**Feature:** Freelancer availability data for Saturday/Sunday now persists after page reload  
**Bug Fixed:** BUG-001 (P1 BLOCKER) - Availability data loss on reload  
**Test Date:** 2026-03-20  
**Status:** Ready for Staging Validation  

---

## 🎯 Prerequisites

### Environment Setup
- Frontend: Running on `http://localhost:5173` (dev) or staging URL
- Backend: Running on `https://api.freelaservicos.com.br` (production) or staging URL
- Database: PostgreSQL with latest migration applied (`prisma migrate deploy`)
- Test User: Freelancer account with provider role

### Required Tools
- Browser DevTools (Network tab, Console)
- Postman or similar API client (for manual API testing)
- Terminal for logs

---

## ✅ Test Suite 1: Happy Path (Core Functionality)

### Test 1.1: Save Availability for Saturday
**Steps:**
1. Log in as freelancer
2. Navigate to Profile → Configurações → Disponibilidade
3. Check "Sábado" (Saturday)
4. Set horário: De 09:00, Até 18:00
5. Click "Salvar Disponibilidade"
6. Verify success toast: "Disponibilidade salva com sucesso"

**Expected Behavior:**
- ✅ Toast appears immediately (< 2 seconds)
- ✅ Loading spinner shows during save
- ✅ "Sábado" remains checked in the UI

**Verification:**
- Check backend logs: `POST /providers/:id/availability` called successfully
- Check database: `Provider.availability` contains Saturday with correct hours

---

### Test 1.2: Reload Page and Verify Data Persists
**Steps:**
1. After Test 1.1 passes, refresh the page (F5)
2. Wait for page to fully load
3. Navigate back to Profile → Configurações → Disponibilidade

**Expected Behavior:**
- ✅ "Sábado" is still checked
- ✅ Horário shows: De 09:00, Até 18:00
- ✅ Data loaded from API (check Network tab: `GET /providers/[id]`)

**Verification:**
- Network tab shows GET request fetches availability data
- State is hydrated on component mount

---

### Test 1.3: Save Availability for Sunday
**Steps:**
1. Check "Domingo" (Sunday)
2. Set horário: De 10:00, Até 17:00
3. Click "Salvar Disponibilidade"
4. Verify success toast

**Expected Behavior:**
- ✅ Toast appears
- ✅ "Domingo" remains checked
- ✅ Both Saturday AND Sunday now saved

**Verification:**
- Database contains both days with correct hours
- No conflicts between Saturday and Sunday data

---

### Test 1.4: Modify Existing Availability
**Steps:**
1. Change Saturday hours: De 08:00, Até 19:00
2. Click "Salvar Disponibilidade"
3. Refresh page
4. Verify updated hours appear

**Expected Behavior:**
- ✅ Saturday hours changed to 08:00-19:00
- ✅ Sunday hours remain 10:00-17:00
- ✅ Data persists after reload

**Verification:**
- PATCH request shows updated payload
- Database reflects changes

---

### Test 1.5: Uncheck Day and Save
**Steps:**
1. Uncheck "Sábado"
2. Click "Salvar Disponibilidade"
3. Refresh page

**Expected Behavior:**
- ✅ "Sábado" remains unchecked
- ✅ "Domingo" still checked
- ✅ Saturday data removed from backend

**Verification:**
- Database shows Saturday as inactive/removed
- Only Sunday remains in availability object

---

## ⚠️ Test Suite 2: Error Handling & Validation

### Test 2.1: Invalid Time Range (Até < De)
**Steps:**
1. Set horário: De 18:00, Até 09:00
2. Click "Salvar Disponibilidade"

**Expected Behavior:**
- ✅ Error toast: "Horário inválido: 'Até' deve ser maior que 'De'"
- ❌ No API call made
- ✅ Data not saved to backend

**Verification:**
- Network tab shows NO POST/PATCH request
- Error handled gracefully without crashing

---

### Test 2.2: Empty Horário (Save Without Setting Hours)
**Steps:**
1. Check "Sábado"
2. Leave "De" and "Até" empty
3. Click "Salvar Disponibilidade"

**Expected Behavior:**
- ✅ Error toast: "Preencha os horários para todos os dias marcados"
- ❌ No API call made

**Verification:**
- Validation prevents incomplete data from being sent

---

### Test 2.3: Network Error During Save
**Steps:**
1. Set availability for Saturday
2. Simulate network failure (DevTools → Network → Offline)
3. Click "Salvar Disponibilidade"

**Expected Behavior:**
- ✅ Error toast appears: "Erro ao salvar disponibilidade"
- ✅ Loading spinner hides after timeout
- ✅ UI remains responsive
- ✅ User can retry

**Verification:**
- Error caught and handled
- No silent failures
- User can retry without data corruption

---

### Test 2.4: Expired JWT Token
**Steps:**
1. Set availability for Saturday
2. Wait for or manually expire JWT token (or use expired token in DevTools)
3. Click "Salvar Disponibilidade"

**Expected Behavior:**
- ✅ Error toast: "Erro ao salvar disponibilidade" (or auth-specific message)
- ✅ User redirected to login OR automatic refresh token triggered
- ✅ No partial data saved

**Verification:**
- Backend returns 401 Unauthorized
- Frontend handles gracefully

---

### Test 2.5: Server Returns 500 Error
**Steps:**
1. Manually trigger backend error (e.g., corrupt data or simulate exception)
2. Try to save availability

**Expected Behavior:**
- ✅ Error toast: "Erro ao salvar disponibilidade"
- ✅ No data corruption
- ✅ User can retry

**Verification:**
- Error handling works for 5xx errors
- User not blocked

---

## 📊 Test Suite 3: Multi-Day Scenarios

### Test 3.1: Save Multiple Days in Sequence
**Steps:**
1. Check Mon-Sun with different hours each
2. Save
3. Reload
4. Verify all days persisted correctly

**Expected Behavior:**
- ✅ All 7 days saved with correct hours
- ✅ No conflicts or data loss

**Verification:**
- Database contains all entries
- UI displays all days correctly after reload

---

### Test 3.2: Partial Availability (Only Weekends)
**Steps:**
1. Uncheck Mon-Fri
2. Check Sat-Sun
3. Save
4. Reload

**Expected Behavior:**
- ✅ Only Sat-Sun available
- ✅ Mon-Fri not in availability object

**Verification:**
- Backend returns only 2 days
- No default/ghost days appearing

---

### Test 3.3: No Availability Selected
**Steps:**
1. Uncheck all days
2. Click "Salvar Disponibilidade"

**Expected Behavior:**
- ✅ Save succeeds (empty availability is valid)
- ✅ After reload: all days unchecked

**Verification:**
- Freelancer marked as unavailable
- No errors thrown for empty availability

---

## 🔐 Test Suite 4: Security & Authorization

### Test 4.1: Cannot Update Other User's Availability
**Steps:**
1. Intercept PATCH request in DevTools
2. Change provider ID to another user's ID
3. Send request

**Expected Behavior:**
- ✅ Backend returns 403 Forbidden
- ✅ Data not modified for other user

**Verification:**
- Ownership check in controller prevents unauthorized updates

---

### Test 4.2: Must Be Authenticated
**Steps:**
1. Remove JWT token from localStorage
2. Try to save availability

**Expected Behavior:**
- ✅ Backend returns 401 Unauthorized
- ✅ User redirected to login

**Verification:**
- No anonymous saves allowed

---

## 📱 Test Suite 5: UI/UX Behavior

### Test 5.1: Loading Indicator Shows During Save
**Steps:**
1. Set availability
2. Slow down network (DevTools → Network → Slow 3G)
3. Click "Salvar"
4. Observe loading spinner

**Expected Behavior:**
- ✅ Spinner visible while saving
- ✅ Button disabled during request
- ✅ Spinner hidden after response

**Verification:**
- User cannot double-click save
- Clear visual feedback

---

### Test 5.2: Toast Notifications Clear Correctly
**Steps:**
1. Save availability (success toast)
2. Wait 5 seconds
3. Save again with invalid data (error toast)
4. Observe toast behavior

**Expected Behavior:**
- ✅ Success toast auto-dismisses after ~3s
- ✅ Error toast stays visible (or longer timeout)
- ✅ Toasts don't overlap

**Verification:**
- Toast library (Sonner) working correctly

---

### Test 5.3: Form State Consistency
**Steps:**
1. Make changes to availability
2. Without saving, navigate away
3. Return to Disponibilidade page

**Expected Behavior:**
- ✅ Either warn user of unsaved changes OR reload from database
- ✅ No ghost/partial data

**Verification:**
- State management prevents data loss
- User sees actual saved state

---

## 🗄️ Test Suite 6: Database Integrity

### Test 6.1: Verify Database Schema
**Steps:**
1. Connect to PostgreSQL
2. Query: `SELECT * FROM "Provider" WHERE id = [test-user-id];`
3. Check `availability` column

**Expected Behavior:**
- ✅ Column exists
- ✅ Contains JSON with structure: `{ "dias": [...], "horarios": {...} }`
- ✅ Data is valid JSON

**Verification:**
```sql
SELECT 
  id, 
  email, 
  availability::text 
FROM "Provider" 
WHERE id = '[provider-id]';
```

---

### Test 6.2: Verify Migration Applied
**Steps:**
1. Check migration files: `prisma/migrations/`
2. Verify migration timestamp matches implementation date
3. Run: `prisma migrate status`

**Expected Behavior:**
- ✅ Migration applied successfully
- ✅ No pending migrations

**Verification:**
- Backend runs without migration warnings

---

## 📈 Test Suite 7: Performance & Concurrency

### Test 7.1: Rapid Successive Saves
**Steps:**
1. Set availability
2. Immediately save, then save again without waiting
3. Observe behavior

**Expected Behavior:**
- ✅ Button disabled during request (prevents double-submit)
- ✅ Only 1 PATCH request sent (debouncing or disable logic)
- ✅ Latest state wins if race condition occurs

**Verification:**
- Network tab shows only 1 request
- No duplicate data in database

---

### Test 7.2: Large Dataset Performance
**Steps:**
1. Save full availability (all 7 days)
2. Measure API response time

**Expected Behavior:**
- ✅ Response time < 500ms
- ✅ No timeouts

**Verification:**
- Network tab shows latency
- SLA met

---

## 🎬 Complete Test Flow (Manual E2E)

### Comprehensive Flow (15-20 minutes)
1. ✅ Test 1.1: Save Saturday
2. ✅ Test 1.2: Reload and verify
3. ✅ Test 1.3: Save Sunday
4. ✅ Test 2.1: Invalid time range error
5. ✅ Test 4.1: Unauthorized access attempt
6. ✅ Test 5.1: Loading indicator
7. ✅ Test 6.1: Database verification
8. ✅ Test 1.4: Modify and reload
9. ✅ Test 1.5: Uncheck and verify

---

## 📋 Validation Checklist

| Category | Test | Status | Notes |
|----------|------|--------|-------|
| **Happy Path** | 1.1: Save Sat | ⬜ | |
| | 1.2: Reload Persist | ⬜ | |
| | 1.3: Save Sun | ⬜ | |
| | 1.4: Modify | ⬜ | |
| | 1.5: Uncheck | ⬜ | |
| **Error Handling** | 2.1: Invalid Range | ⬜ | |
| | 2.2: Empty Hours | ⬜ | |
| | 2.3: Network Error | ⬜ | |
| | 2.4: Expired Token | ⬜ | |
| | 2.5: Server 500 | ⬜ | |
| **Multi-Day** | 3.1: Multiple Days | ⬜ | |
| | 3.2: Weekends Only | ⬜ | |
| | 3.3: No Availability | ⬜ | |
| **Security** | 4.1: Other User | ⬜ | |
| | 4.2: Not Auth | ⬜ | |
| **UI/UX** | 5.1: Loading | ⬜ | |
| | 5.2: Toast Dismiss | ⬜ | |
| | 5.3: Form State | ⬜ | |
| **Database** | 6.1: Schema | ⬜ | |
| | 6.2: Migration | ⬜ | |
| **Performance** | 7.1: Rapid Saves | ⬜ | |
| | 7.2: Large Data | ⬜ | |

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. Issue QA APPROVED status
2. Update `docs/changelog.md` with final approval
3. Ready for production deployment
4. Ensure backend migration is applied before deployment: `npx prisma migrate deploy`

### If Tests Fail ❌
1. Document specific failure with:
   - Test number
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs
2. Create new bug ticket with P level
3. Delegate to appropriate agent (dev-backend or dev-frontend)
4. Re-test after fix

---

## 📝 Test Results Summary

**Total Tests:** 22  
**Passed:** ⬜  
**Failed:** ⬜  
**Blocked:** ⬜  

**Overall Status:** ⬜ PENDING

---

Generated: 2026-03-20 | QA Agent | Feature: Provider Availability Persistence v0.8.0
