import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("서버 연결 테스트 API+ page_url 확인 API")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: "Hello World! RUWITY? 뜨면 연결 성공입니다",
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
