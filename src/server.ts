import app from './app'
import { server } from '../config/index'

const port: number = parseInt(server.PORT) || 9000

app.listen(port, () => {
  console.log(`Vega-editor backend server listening on port ${port}`)
})
