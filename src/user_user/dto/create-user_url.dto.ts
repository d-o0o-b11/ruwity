import { PickType } from "@nestjs/swagger";
import { UserUrlEntity } from "../../user_url/entities/user_url.entity";

export class CreateUserUrlDto extends PickType(UserUrlEntity, [
  "img",
  "title",
  "url",
]) {
  constructor(data: Partial<CreateUserUrlDto>) {
    super();
    Object.assign(this, data);
  }
}
