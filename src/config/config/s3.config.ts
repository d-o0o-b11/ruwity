import { S3 } from "aws-sdk";

export const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
  signatureVersion: "v4",
});

/**
 * @memo
 * aws-sdk를 사용하는 s3 객체는 NestJS의 구성으로 설정되는 것이 아니므로 @nestjs/config의 registerAs를 사용하여 Joi를 적용할 수는 없습니다.
 * aws-sdk의 S3 객체를 설정하기 위해서는 AWS의 인증 정보(accessKeyId, secretAccessKey)와 리전(region)을 환경 변수로 설정하는 대신, 일반적인 방법으로 환경 변수를 직접 사용하면 됩니다
 */
