import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../shared/mail.service';
import { SignupDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private mailService;
    constructor(prisma: PrismaService, jwtService: JwtService, mailService: MailService);
    signup(dto: SignupDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    private generateTokens;
}
