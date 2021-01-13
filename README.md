# BIZM SMS 전송 라이브러리

## Initallize

```js
// userid: 비즈엠의 사용자 아이디
// profile: 발신자 프로파일
const sms = new Bizmsg(userid, profile);
```

---

## Usage

```js
const sms = new Bizmsg(userid, profile);

/** 알림톡 1인발송 */
sms.sendSingleAlimTalk('휴대전화번호', '템플릿아이디', '템플릿 데이터', option);

/** 알림톡 다중발송 */
sms.sendMultipleAlimTalk(['휴대전화번호'], '템플릿아이디', '템플릿 데이터', option);

/** 친구톡 1인발송 */
sms.sendSingleFriendsTalk('휴대전화번호', '메시지', option);

/** 친구톡 다중발송 */
sms.sendMultipleFriendsTalk(['휴대전화번호'], '메시지' option);
```

---

### Option params

```json
{
  "smsType": "at" | "ft", // 메시지 전송 타입 [at: 알림톡, ft: 친구톡]
  "reserveDt": "00000000000000", // 예약발송 YYYYMMDDHHmmss [00000000000000: 즉시 발송]
  "msgSms": "", // 친구톡 발송실패치 문자대체 발송 메시지 [대체하지 않으면 null]
  "smsKind": "L" | "M" | "S", // 대체문자 발송시 문자 전송타입 [L: LMS, M: MMS, S: SMS] 비즈엠 관리페이지의 설정과 동일해야함
  "smsSender": "", // 대체문자 발송시 발신자 전화번호, 비즈엠 관리페이지에 등록된 발신번호
  "smsOnly": "Y" | "N" // 대체문자 발송시 친구톡 발송성공여부와 상관없이 문자로 전송 [Y: 활성, N: 비활성]
}
```

### Response

```json
[
  {
    "code": "success" | "fail",
    "data": {
        "phn": "821000000000", // 전송 시도된 전화번호 국제번호 82포함
        "type": "at" | "ft" | "S" | "L" | "M" // at: 알림톡 전송, ft: 친구톡 전송, S: SMS전송, L: LMS전송, M: MMS 전송
    }
  },
  ...
]
```
