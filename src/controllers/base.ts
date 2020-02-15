import { Router } from 'express';

/**
 * Interface for defining structure of a controller
 */
interface IBaseController {
  /**
   * Property to store root path of route for accessing the controller
   * functions.
   */
  path: string;
  /**
   * Property to store routes of controller.
   */
  router: Router;
}

/**
 * _Export `IBaseController` interface._
 */
export default IBaseController;
