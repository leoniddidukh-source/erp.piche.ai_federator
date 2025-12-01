import type { Request, Response } from 'express';
import { Router } from 'express';

import { firebaseService } from '../services/firebaseService';

export const moduleStateRouter = Router();

/**
 * GET /api/v1/module-state
 * Get state of all modules or a specific module
 */
moduleStateRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { moduleName, startDate, endDate } = req.query;

    const logs = await firebaseService.getModuleLogs(
      moduleName as string | undefined,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      logs,
      count: logs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching module state:', error);
    res.status(500).json({
      error: 'Failed to fetch module state',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/v1/module-state/:moduleName
 * Get state of a specific module
 */
moduleStateRouter.get('/:moduleName', async (req: Request, res: Response) => {
  try {
    const { moduleName } = req.params;

    const moduleState = await firebaseService.getModuleState(moduleName);

    if (!moduleState) {
      return res.status(404).json({
        error: `Module "${moduleName}" not found`,
      });
    }

    res.json({
      module: moduleName,
      state: moduleState,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching module state:', error);
    res.status(500).json({
      error: 'Failed to fetch module state',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/v1/module-state/modules/list
 * Get list of all available modules
 */
moduleStateRouter.get('/modules/list', async (req: Request, res: Response) => {
  try {
    const modules = await firebaseService.getAvailableModules();

    res.json({
      modules,
      count: modules.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching module list:', error);
    res.status(500).json({
      error: 'Failed to fetch module list',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
