import express from 'express';
import cors from 'cors'
import functionsServer from './routes/function.js'
import mongoose from "mongoose";
import 'dotenv/config'

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', functionsServer);
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  const MONGODB_URL = process.env.MONGODB_URL || 'tecturl'
  console.log(MONGODB_URL," check")
  mongoose.connect( MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  const PORT = process.env.PORT || 4000 
  app.listen(PORT,()=>{
    console.log("server running on ", PORT)
  })

  export default app