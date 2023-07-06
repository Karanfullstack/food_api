import {User} from "../../models";

const userController = {
  async me(req, res, next) {
    try {
      const user = await User.findOne({_id: req.user._id});
    } catch (error) {}
  },
};

export default userController;
