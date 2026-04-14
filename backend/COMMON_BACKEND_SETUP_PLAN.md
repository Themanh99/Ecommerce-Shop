# Backend Common Layer Rollout Plan (NestJS)

## Summary
- Hoan thien va chuan hoa `src/common/*` de dung chung cho toan backend.
- Chuan hoa response success/error toan cuc qua interceptor + exception filter.
- Refactor `auth` va `mail` de bo hardcode (OTP, cookie, validate, date).
- Dong bo implementation voi file plan nay.

## Public APIs / Interfaces Changes
1. Chuan response API moi qua DTO:
`{ success: boolean, message: string, data: T | null, timestamp: string, path?: string, error?: unknown }`
2. Decorators dung lai:
`@ValidateEmail()`, `@ValidatePhone()`, `@IsVietnamPhone()`, `@ValidateContact()`
3. Chuyen `GetUser` sang common:
`src/common/decorators/get-user.decorator.ts`
4. Constants dung chung:
`APP_TIMEOUTS`, `REGEX_PATTERNS`, `API_LIMITS`, `COOKIE_KEYS`, `COOKIE_PATHS`, `getCookieConfig`, `ERROR_MESSAGES`

## Implementation Plan
1. Dependency alignment
- Cap nhat `package.json` voi `dayjs`, `lodash`, `lodash-es`, `@types/lodash`.
- Cai package va cap nhat lockfile neu moi truong cho phep.

2. Common constants
- Dat toan bo magic numbers vao `src/common/constants/app.constants.ts`.
- Chuan hoa error messages theo tieng Viet khong dau.

3. Date utilities
- Cau hinh dayjs (utc, timezone, locale vi) trong `src/common/utils/date.util.ts`.
- Cung cap APIs: `formatDate`, `addMinutes`, `addHours`, `addDays`, `isExpired`, `getUnixTimestamp`, `parseDate`.

4. String utilities
- Dung lodash helpers trong `src/common/utils/string.util.ts`.
- APIs: `slugify`, `truncateText`, `capitalizeText`, `toCamelCase`, `toPascalCase`, `validateEmail`, `validatePhone`, `generateSecureString`, `randomOtp`, `stripHtmlTags`.

5. Response interceptor
- Bat global response wrapper bang `APP_INTERCEPTOR` tai `app.module.ts`.
- Neu payload da co `success` thi khong wrap lai.
- Neu payload chi co `message` thi map thanh `data: null`.

6. Exception filter
- Bat global `HttpExceptionFilter` trong `main.ts`.
- Handle `HttpException` va Prisma known errors (`P2002`, `P2003`, `P2025`).
- Error response theo format chuan voi `success: false`.

7. Logger wrapper
- Dung `AppLoggerService` lam logger chinh cho app.
- `main.ts` goi `app.useLogger(app.get(AppLoggerService))`.
- Exception filter log message + stack + context request.

8. Auth service refactor
- Dung `randomOtp(6)` va `validateEmail()` tu common.
- Dung `addMinutes/addDays` + `APP_TIMEOUTS` cho OTP expiry, refresh expiry, blacklist TTL.
- Loai bo hardcoded `Date.now() + ...`.

9. Auth controller refactor
- Chuyen `GetUser` import sang common.
- Dung `COOKIE_KEYS` + `getCookieConfig()` cho set/clear cookie.
- Giu nguyen redirect behavior cua Google callback.

10. Auth DTO refactor
- Dung decorators trong common.
- `contact` dung `@ValidateContact()` de chap nhan email hoac VN phone.
- Ho tro `@IsVietnamPhone()` va `@ValidateEmail()` cho field chuyen biet.

11. Mail service refactor
- Dung `formatDate()` cho timestamp trong email.
- Dung `truncateText()` cho cac bien text dai trong template.

12. Bootstrap wiring
- `app.module.ts`: throttle dung `API_LIMITS`, dang ky `APP_INTERCEPTOR`, provide `AppLoggerService`.
- `main.ts`: dang ky `HttpExceptionFilter`, `useLogger`, giu middleware/guards setup hien tai.

13. Cleanup & consistency
- Xoa file cu `src/auth/decorators/get-user.decorator.ts` de tranh duplicate.
- Grep repo de tim hardcoded TTL/cookie key/regex con sot.

## Test Cases and Scenarios
1. Build/type check
- `npm run build` pass, khong loi import/decorator/interceptor/filter.

2. Auth flow manual
- `POST /api/auth/send-otp`: response duoc wrap chuan.
- `POST /api/auth/login`: cookie dung TTL/path/sameSite/secure theo env.
- `POST /api/auth/refresh` thieu cookie: tra error format chuan `success:false`.

3. Validation
- Contact sai format tra validation error theo wrapper chuan.
- Decorator phone-only hoat dong dung voi `@IsVietnamPhone()`.

4. Exception formatting
- Trigger `BadRequestException` va Prisma `P2002` de kiem tra error shape.

5. Regression
- Google callback van redirect dung.
- `GET /api/auth/me` van lay user qua `@GetUser('sub')`.

## Assumptions and Defaults
1. Response wrapper ap dung cho toan bo endpoint JSON.
2. Message dung tieng Viet khong dau de tranh loi encoding terminal.
3. JWT expiry string tu `.env` duoc uu tien; constants dung cho TTL logic DB/Redis/cookie.
4. Khong dung Winston o phase nay; dung logger native cua NestJS.
5. Khong thay doi endpoint URL contracts hien tai.
