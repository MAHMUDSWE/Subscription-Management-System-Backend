import { ApiProperty } from '@nestjs/swagger';

class UserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    role: string;
}

export class AuthResponseDto {
    @ApiProperty()
    access_token: string;

    @ApiProperty()
    refresh_token: string;

    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;
}
