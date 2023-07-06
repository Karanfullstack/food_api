import CustomErrorHandler from "../services/CustomErrorHandler";

const auth = (req, res, next) => {
  let authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader) {
    return next(CustomErrorHandler.unAuthorized());
  }
  const token = authHeader.split(" ")[1];
  try {
    
  } catch (error) {
    return next(CustomErrorHandler.unAuthorized());
  }
};

export default auth;
