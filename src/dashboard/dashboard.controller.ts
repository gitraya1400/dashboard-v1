import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AdminJwtGuard } from 'src/auth/guards/admin-jwt.guard';

@Controller('dashboard')
@UseGuards(AdminJwtGuard)  // Semua endpoint di controller ini memerlukan JWT
export class DashboardController {
  /**
   * GET /dashboard
   * Dapatkan data dashboard admin
   */
  @Get()
  getDashboard(@Req() request: Request) {
    const user = (request as any)['user'];
    
    return {
      success: true,
      message: 'Dashboard data berhasil diambil',
      data: {
        welcome: `Selamat datang, ${user?.username}!`,
        stats: {
          totalUsers: 150,
          totalResponden: 89,
          activeSurveys: 12,
          completedSurveys: 45,
        },
        recentActivity: [
          { id: 1, action: 'Created survey', timestamp: '2024-11-12 15:30:00' },
          { id: 2, action: 'Updated responden', timestamp: '2024-11-12 14:15:00' },
        ],
      },
      user: {
        id: user?.userId,
        username: user?.username,
        role: user?.role,
      },
    };
  }

  /**
   * GET /dashboard/statistics
   * Dapatkan statistik dashboard
   */
  @Get('statistics')
  getStatistics(@Req() request: Request) {
    const user = (request as any)['user'];

    return {
      success: true,
      message: 'Statistik dashboard',
      data: {
        users: {
          total: 150,
          active: 120,
          inactive: 30,
        },
        responden: {
          total: 89,
          completed: 65,
          pending: 24,
        },
        surveys: {
          total: 12,
          active: 5,
          completed: 7,
        },
      },
    };
  }

  /**
   * GET /dashboard/logs
   * Dapatkan activity logs
   */
  @Get('logs')
  getActivityLogs(@Req() request: Request) {
    const user = (request as any)['user'];

    return {
      success: true,
      message: 'Activity logs',
      data: [
        {
          id: 1,
          action: 'LOGIN',
          user: 'admin',
          timestamp: '2024-11-12 15:30:00',
          ip: '192.168.1.100',
        },
        {
          id: 2,
          action: 'CREATE_SURVEY',
          user: 'admin',
          timestamp: '2024-11-12 15:25:00',
          ip: '192.168.1.100',
        },
        {
          id: 3,
          action: 'UPDATE_RESPONDEN',
          user: 'admin',
          timestamp: '2024-11-12 14:15:00',
          ip: '192.168.1.100',
        },
      ],
    };
  }
}
