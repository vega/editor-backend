import { Router } from 'express'

/**
 * Interface for defining structure of a controller
 */
interface IController {
  // Property to store root path of route for accessing the controller fucntions
  path: string;
  // Property to store routes of controller
  router: Router;
}

/**
 * Export interface IController
 */
export default IController
