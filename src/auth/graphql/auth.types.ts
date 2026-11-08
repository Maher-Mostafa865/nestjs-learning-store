import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Role } from '../../generated/prisma/client.js';

registerEnumType(Role, { name: 'Role' });

@ObjectType()
export class AuthUserType {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field(() => Role)
  role: Role;
}

@ObjectType()
export class AuthTokensType {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => Int)
  expiresIn: number;
}

@ObjectType()
export class SignedInType extends AuthTokensType {
  @Field(() => AuthUserType)
  user: AuthUserType;
}
