const fs = require('fs');
const path = require('path');
const util = require('util');
const axios = require('axios');
const { chunk, uniq, flatten } = require('lodash');

/** 문자 치환 */
function StringFormat(body, data) {
  let text = body;
  for (const key in data) {
    const regex = new RegExp('\\{' + key + '\\}', 'g');
    text = text.replace(regex, data[key]);
  }

  return text;
}

/** 전화번호 변경하기 */
function convertPhoneNumber(phone) {
  return phone.replace(/-/g, '').replace(/^0/, '82');
}

/** BIZM Controller */
class Bizmsg {
  defaultForm = {
    message_type: 'at',
    reserveDt: '00000000000000',
  };
  constructor(userid, profile) {
    this.defaultForm = Object.assign({}, this.defaultForm, { profile });
    this.request = axios.create({
      baseURL: 'https://alimtalk-api.bizmsg.kr',
      headers: {
        userid,
        'Content-Type': 'application/json',
      },
    });
  }

  /** 알림톡 템플릿 데이터 바인딩 */
  async getTemplateMessageBody(tmplId, data = {}) {
    let message = await util.promisify(fs.readFile)(path.join(__dirname, 'assets', tmplId));
    return StringFormat(message.toString(), data);
  }

  /** 알림톡 한명 보내기 */
  async sendSingleAlimTalk(phone, templateId, data = {}, option = {}) {
    let message = await this.getTemplateMessageBody(templateId, data);

    const form = Object.assign(
      {},
      this.defaultForm,
      {
        message_type: 'at',
        phn: convertPhoneNumber(phone),
        msg: message,
        tmplId: templateId,
      },
      option,
    );

    return this.send([form]);
  }

  /** 알림톡 여러명 보내기 */
  async sendMultipleAlimTalk(phones = [], templateId, data = {}, option = {}) {
    let message = await this.getTemplateMessageBody(templateId, data);
    const distictPhoneNumbers = uniq(phones);
    const forms = distictPhoneNumbers.map((phone) => {
      return Object.assign(
        {},
        this.defaultForm,
        {
          message_type: 'at',
          phn: convertPhoneNumber(phone),
          tmplId: templateId,
          msg: message,
        },
        option,
      );
    });
    const divide100Forms = chunk(forms, 100);

    return Promise.all(divide100Forms.map(this.send)).then((data) => flatten(data));
  }

  /** 친구톡 한명 보내기 */
  sendSingleFriendsTalk(phone, message, option = {}) {
    const form = Object.assign(
      {},
      this.defaultForm,
      {
        message_type: 'ft',
        phn: convertPhoneNumber(phone),
        msg: message,
      },
      option,
    );

    return this.send([form]);
  }

  /** 친구톡 여러명 보내기 */
  sendMultipleFriendsTalk(phones, message, option = {}) {
    const distictPhoneNumbers = uniq(phones);
    const forms = distictPhoneNumbers.map(convertPhoneNumber).map((phone) => {
      return Object.assign(
        {},
        this.defaultForm,
        {
          message_type: 'ft',
          phn: convertPhoneNumber(phone),
          msg: message,
        },
        option,
      );
    });

    const divide100Forms = chunk(forms, 100);

    return Promise.all(divide100Forms.map(this.send)).then((data) => flatten(data));
  }

  /** 전송하기 */
  send(forms) {
    return this.request({
      method: 'POST',
      url: '/v2/sender/send',
      data: forms,
    }).then((result) => result.data);
  }
}

module.exports = Bizmsg;
