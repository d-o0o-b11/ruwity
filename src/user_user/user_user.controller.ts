import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CtxUser } from 'src/decorator/auth.decorator';
import { JWTToken } from 'src/kakao-login/dto/jwt-token.dto';
import { JwtAccessAuthGuard } from 'src/kakao-login/jwt-access.guard';
import { UserUserService } from './user_user.service';
import { CreateUserInfoDto } from './dto/create-user-info.dto';
import { UserReportDto } from './dto/save-user-report.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ActionTapDto } from './dto/tap-delete.dto';

@ApiTags('유저 API')
@Controller('user-user')
export class UserUserController {
  constructor(private readonly userUserService: UserUserService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary:
      '유저 정보 출력(프로필(개발 미완),닉네임,한 줄 표현, 오늘의 링크, 페이지 링크',
  })
  @Get('/profile')
  async getUserInfo(@CtxUser() token: JWTToken) {
    try {
      return await this.userUserService.getUserInfo(token.id);
    } catch (e) {
      if (e instanceof NotFoundException)
        throw new NotFoundException(e.message);

      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '유저가 신규인지 아닌지 구별',
  })
  @Get('user_type')
  async userTypeCheck(@CtxUser() token: JWTToken) {
    try {
      return await this.userUserService.userTypeCheck(token.id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  //pipe 오류
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '유저 닉네임, 한 줄 표현, 프로필,오늘의 링크 저장',
    description: `
    삭제인 경우 \n
    1. link -> {*column: 'link', method:'delete', *tap_id:1} \n
    2. text -> {*column: 'text', method:'delete', *tap_id:1} \n
    3. 프로필 이미지 -> {*column: 'profile', method:'delete'} \n
    4. 탭 링크 이미지 -> {*column: 'link', method:'delete', *tap_id:1, *link_img_delete:true} 
    -------------------------------------------------------
    업데이트인 경우 \n
    1. link -> {*column: 'link', *tap_id:1, title:'링크 제목', url:'링크 url', toggle_state:'true/false', folded_state:'true/false', 이미지는 여기가 아니라 profile쪽이랑 같은 곳입니다!link_img } \n
    2. text -> {*column: 'text', *tap_id:1, context:'텍스트 내용', toggle_state:'true/false', folded_state:'true/false'} \n
    3. 프로필 이미지 -> profile에 이미지 넣고 , { column: 'profile' } \n
    `,
  })
  @ApiBody({ type: CreateUserInfoDto })
  @ApiConsumes('multipart/form-data') // 추가: 멀티파트 폼 데이터를 사용하도록 설정
  // @UseInterceptors(FileInterceptor('profile'))
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profile' }, { name: 'link_img' }]),
  )
  @Patch('profile')
  async saveUserInfo(
    @CtxUser() token: JWTToken,
    @Body()
    dto: CreateUserInfoDto,
    // @UploadedFile() file: Express.Multer.File,
    @UploadedFiles()
    files: {
      profile?: Express.Multer.File[];
      link_img?: Express.Multer.File[];
    },
  ) {
    // console.log('ddfdf', dto.actions);
    if (files?.profile || files?.link_img) {
      return await this.userUserService.saveUserInfo(
        token.id,
        dto,
        files.profile,
        files.link_img,
      );
    }

    return await this.userUserService.saveUserInfoNoFIle(token.id, dto);
  }

  @Get('check/page/:url')
  @ApiOperation({
    summary: '페이지 생성 중복 확인',
  })
  async checkPage(@Param('url') url: string) {
    try {
      return await this.userUserService.checkPage(url);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '성별, 나이, 페이지url 저장',
    description: '성별(남자 male, 여자 female, 표시안함 null',
  })
  @Post('report')
  async saveGenderAge(
    @CtxUser() token: JWTToken,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: UserReportDto,
  ) {
    try {
      return await this.userUserService.saveGenderAge(token.id, dto);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '오늘의 링크 프로필로 적용하기',
  })
  @Patch('update/todayLink/:url_id')
  async updateTodayLink(
    @CtxUser() token: JWTToken,
    @Param('url_id') url_id: number,
  ) {
    try {
      return await this.userUserService.updateTodayLink(token.id, url_id);
    } catch (e) {
      if (e instanceof NotFoundException)
        throw new NotFoundException(e.message);

      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '로그아웃',
  })
  @Post('logout')
  async logoutUser(@CtxUser() token: JWTToken) {
    try {
      return await this.userUserService.logoutTokenNull(token.id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '계정 탈퇴',
  })
  @Post('resign')
  async userWithdraw(@CtxUser() token: JWTToken) {
    try {
      return await this.userUserService.userWithdraw(token.id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // @Post('imgtest')
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FileInterceptor('file')) // 파일을 업로드한 후, multer로부터 업로드된 파일 객체를 받음
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: {
  //         // 👈 this property
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })
  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   // 파일을 S3에 업로드하기 전에 폴더 경로를 추가하여 Key를 생성
  //   const folderName = 'profile'; // 원하는 폴더명
  //   const key = `${folderName}/${file.originalname}`;

  //   // S3에 파일 업로드
  //   const result = await this.userUserService.uploadFile(key, file.buffer);

  //   // 업로드 결과 등을 처리하는 로직 추가

  //   return result;
  // }

  // @Get('tetst')
  // async testster() {
  //   const key = 'profile/5/images.jpeg';
  //   return await this.userUserService.getPreSignedUrl(key);
  // }
}
