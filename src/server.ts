import app from './app'
import { server } from '../config/index'

const port: number = parseInt(server.PORT) || 9000

/**
 * Starts the server
 * 
 * @param {number} port Port number where the server runs
 * @param {function} callback Callback function after the server is started
 */
app.listen(port, () => {
  console.log(`Vega-editor backend server listening on port ${port}`)
})
