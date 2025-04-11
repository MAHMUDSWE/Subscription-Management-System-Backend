import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UserRole } from '../../entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ORGANIZATION_OWNER)
  @ApiBearerAuth()
  create(@Body() createOrganizationDto: CreateOrganizationDto, @Request() req) {
    return this.organizationsService.create(createOrganizationDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Return all organizations.' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.organizationsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Get('owner/:ownerId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ORGANIZATION_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  findByOwner(
    @Param('ownerId') ownerId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.organizationsService.findByOwner(ownerId, paginationDto);
  }
}