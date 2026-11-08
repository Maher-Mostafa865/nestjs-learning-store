import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength } from 'class-validator';

/** Sign-in does not enforce the current minimum length, so an older password still works. */
@InputType()
export class SignInDto {
  @Field()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @Field()
  @IsString()
  @MaxLength(128)
  password: string;
}
