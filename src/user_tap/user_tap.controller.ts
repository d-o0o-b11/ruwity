import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserTapService } from './user_tap.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAccessAuthGuard } from 'src/kakao-login/jwt-access.guard';
import { CreateUserTapTextDto } from './dto/create-user-tap-text.dto';
import { JWTToken } from 'src/kakao-login/dto/jwt-token.dto';
import { CtxUser } from 'src/decorator/auth.decorator';
import { UpdateUserTapTextDto } from './dto/update-user-tap-text.dto';
import { UpdateUserTapFolderState } from './dto/create-user-tap-folder.dto';
import { UpdateUserTapToggle } from './dto/create-user-tap-toggle.dto';
import { CreateUserTapLinkDto } from './dto/create-user-tap-link.dto';
import { UpdateUserTapLinkDto } from './dto/update-user-tap-link.dto';

@ApiTags('Tap API')
@Controller('user-tap')
export class UserTapController {
  constructor(private readonly userTapService: UserTapService) {}

  // @Post(':type')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAccessAuthGuard)
  // @ApiOperation({
  //   summary: 'tap 생성',
  // })
  // @ApiParam({
  //   name: 'type',
  //   description: '탭 타입 (text 또는 link)',
  //   enum: ['text', 'link'],
  // })
  // // @ApiBody({ type: [CreateUserTapTextDto, CreateUserTapLinkDto] }) // CreateUserTapTextDto와 CreateUserTapLinkDto 모두 표시합니다.
  // @ApiExtraModels(CreateUserTapTextDto, CreateUserTapLinkDto) // 여러 DTO를 하나의 컨트롤러 메서드에서 표시합니다.
  // @ApiBody({
  //   schema: {
  //     oneOf: [
  //       {
  //         $ref: getSchemaPath(CreateUserTapTextDto),
  //       },
  //       {
  //         $ref: getSchemaPath(CreateUserTapLinkDto),
  //       },
  //     ],
  //   },
  // })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       data: {
  //         type: 'array',
  //         items: {
  //           oneOf: [
  //             { $ref: getSchemaPath(CreateUserTapTextDto) },
  //             { $ref: getSchemaPath(CreateUserTapLinkDto) },
  //           ],
  //         },
  //       },
  //     },
  //   },
  // })
  // // @ApiBody({ type: [CreateUserTapDtoArray] })
  // async saveTap(
  //   @CtxUser() token: JWTToken,
  //   @Param('type') type: string,
  //   @Body(new ValidationPipe({ whitelist: true, transform: true }))
  //   dto: (CreateUserTapTextDto | CreateUserTapLinkDto)[], // 임시로 any 타입으로 받습니다.
  // ) {
  //   try {
  //     if (type === 'text') {
  //       // type 값이 'text'인 경우에는 CreateUserTapTextDto 배열를 사용하여 처리합니다.
  //       const textDtoArray: CreateUserTapTextDto[] = dto.filter(
  //         (item) => item instanceof CreateUserTapTextDto,
  //       );
  //       return await this.userTapService.saveTapText(token.id, textDtoArray);
  //     } else if (type === 'link') {
  //       // type 값이 'link'인 경우에는 CreateUserTapLinkDto 배열를 사용하여 처리합니다.
  //       const linkDtoArray: CreateUserTapLinkDto[] = dto.filter(
  //         (item) => item instanceof CreateUserTapLinkDto,
  //       );
  //       return await this.userTapService.saveTapLink(token.id, linkDtoArray);
  //     } else {
  //       throw new BadRequestException('Invalid tap type.');
  //     }
  //   } catch (e) {
  //     throw new InternalServerErrorException(e.message);
  //   }
  // }

  //생성은 완료
  @Post('text')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: 'tap text 생성',
  })
  // @ApiBody({ type: [CreateUserTapTextDto] })
  async saveTapText(
    @CtxUser() token: JWTToken,
    // @Body(new ValidationPipe({ whitelist: true, transform: true }))
    // dto: CreateUserTapTextDto[],
  ) {
    try {
      return await this.userTapService.saveTapText(token.id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // @Patch('text')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAccessAuthGuard)
  // @ApiOperation({
  //   summary: 'tap text 내용 수정',
  // })
  // async updateTapText(
  //   @Body(new ValidationPipe({ whitelist: true, transform: true }))
  //   dto: UpdateUserTapTextDto,
  // ) {
  //   try {
  //     return await this.userTapService.updateTapText(dto);
  //   } catch (e) {
  //     throw new InternalServerErrorException(e.message);
  //   }
  // }

  // @Patch('text/folder')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAccessAuthGuard)
  // @ApiOperation({
  //   summary: 'tap text folder 상태 변경 [펼침=true, 접음=false]',
  // })
  // async updateTapFolderState(
  //   @Body(new ValidationPipe({ whitelist: true, transform: true }))
  //   dto: UpdateUserTapFolderState,
  // ) {
  //   try {
  //     return await this.userTapService.updateTapFolderState(dto);
  //   } catch (e) {
  //     throw new InternalServerErrorException(e.message);
  //   }
  // }

  // @Patch('text/toggle')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAccessAuthGuard)
  // @ApiOperation({
  //   summary: 'tap text toggle 상태 변경 [공개=true, 비공개=false]',
  // })
  // async updateTapTextToggle(
  //   @Body(new ValidationPipe({ whitelist: true, transform: true }))
  //   dto: UpdateUserTapToggle,
  // ) {
  //   try {
  //     return await this.userTapService.updateTapTextToggle(dto);
  //   } catch (e) {
  //     throw new InternalServerErrorException(e.message);
  //   }
  // }

  // @Delete('text/:tap_id')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAccessAuthGuard)
  // @ApiOperation({
  //   summary: 'tap text 삭제',
  // })
  // async deleteTapText(@Param('tap_id', new ParseIntPipe()) tap_id: number) {
  //   try {
  //     return await this.userTapService.deleteTapText(tap_id);
  //   } catch (e) {
  //     throw new InternalServerErrorException(e.message);
  //   }
  // }

  // //-------------------------------------------------

  //탭 생성들은 빈객체 넣어서 만들면 될듯
  @Post('link')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: 'tap link 생성',
  })
  // @ApiBody({ type: CreateUserTapLinkDto })
  async saveTapLink(
    @CtxUser() token: JWTToken,
    // @Body(new ValidationPipe({ whitelist: true, transform: true }))
    // dto: CreateUserTapLinkDto,
  ) {
    try {
      return await this.userTapService.saveTapLink(token.id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // @Patch('link')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAccessAuthGuard)
  // @ApiOperation({
  //   summary: 'tap link 내용(제목 or url) 수정 --- 프로필 추가 미완!!',
  // })
  // async updateTapLink(
  //   @Body(new ValidationPipe({ whitelist: true, transform: true }))
  //   dto: UpdateUserTapLinkDto,
  // ) {
  //   try {
  //     return await this.userTapService.updateTapLink(dto);
  //   } catch (e) {
  //     throw new InternalServerErrorException(e.message);
  //   }
  // }

  // @Patch('link/folder')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAccessAuthGuard)
  // @ApiOperation({
  //   summary: 'tap link folder 상태 변경 [펼침=true, 접음=false]',
  // })
  // async updateTapLinkFolderState(
  //   @Body(new ValidationPipe({ whitelist: true, transform: true }))
  //   dto: UpdateUserTapFolderState,
  // ) {
  //   try {
  //     return await this.userTapService.updateTapLinkFolderState(dto);
  //   } catch (e) {
  //     throw new InternalServerErrorException(e.message);
  //   }
  // }

  // @Patch('link/toggle')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAccessAuthGuard)
  // @ApiOperation({
  //   summary: 'tap link toggle 상태 변경 [공개=true, 비공개=false]',
  // })
  // async updateTapLinkTextToggle(
  //   @Body(new ValidationPipe({ whitelist: true, transform: true }))
  //   dto: UpdateUserTapToggle,
  // ) {
  //   try {
  //     return await this.userTapService.updateTapLinkTextToggle(dto);
  //   } catch (e) {
  //     throw new InternalServerErrorException(e.message);
  //   }
  // }

  // @Delete('link/:id')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAccessAuthGuard)
  // @ApiOperation({
  //   summary: 'tap link 삭제',
  // })
  // async deleteTapLink(@Param('id', new ParseIntPipe()) id: number) {
  //   try {
  //     return await this.userTapService.deleteTapLink(id);
  //   } catch (e) {
  //     throw new InternalServerErrorException(e.message);
  //   }
  // }

  //-----------------------------------------------

  @Get('/all')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '모든 탭 출력',
  })
  async findAllUserTages(@CtxUser() token: JWTToken) {
    try {
      return await this.userTapService.findAllByUserIdOrderByCreatedAtDesc(
        token.id,
      );
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
