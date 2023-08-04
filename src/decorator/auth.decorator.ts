import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const CtxUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): ParameterDecorator => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  }
);

/**
 * @memo
 * 커스텀 파라미터 데코레이터/데코레이터 함수 생성하는 함수 => createParamDecorator
 * 컨트롤러의 핸들러 함수의 파라미터를 조작하는 데 사용됩니다.
 * 컨트롤러의 핸들러 함수가 호출될 때, 해당 파라미터의 값을 데코레이터를 통해 변경하거나 원하는 값을 추출할 수 있습니다.
 * ==========================================
 * 데코레이터 함수를 생성하는 함수입니다. 이 함수는 데코레이터로 사용될 함수를 인자로 받고, 해당 함수는 실제로 파라미터 값을 처리하여 반환하는 역할을 합니다.
 * ctx.switchToHttp().getRequest() => 현재의 HTTP 요청 객체를 가져옵니다. / 사용하여 HTTP 요청 객체를 가져온 후, 해당 객체의 user 속성에 사용자 정보가 담겨있다고 가정합니다.
 * ==========================================
 * (_: unknown)
 * - 데코레이터를 적용할 때, 데코레이터 함수의 인자로 전달되는 값입니다. 하지만 이 값은 사용하지 않으므로 TypeScript에서 일반적으로 사용하지 않는 변수 이름 _를 사용하여 표시합니다.
 * (ctx: ExecutionContext): ExecutionContext
 * - NestJS에서 실행 컨텍스트를 나타내는 객체입니다. 이 객체를 통해 현재 요청을 처리하는 데 필요한 정보들을 가져올 수 있습니다.
 * ==========================================
 * (_: unknown, ctx: ExecutionContext) 부분은 파라미터 데코레이터 함수의 시그니처입니다.
 * 데코레이터가 적용되는 함수의 타입을 나타내는 것을 의미합니다.
 *
 */

/**
 * @login_step
 * 1. createParamDecorator를 사용하여 CtxUser 데코레이터를 생성합니다.
 * 2. CtxUser 데코레이터는 컨트롤러의 핸들러 함수의 파라미터로 사용됩니다.
 * 3. 컨트롤러의 핸들러 함수가 호출될 때, 해당 파라미터의 값을 추출하여 현재 사용자 객체를 반환합니다.
 */
