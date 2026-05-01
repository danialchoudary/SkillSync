import Joi from 'joi';

const schema = Joi.object({
  currentPassword: Joi.string().max(128).allow(''),
  newPassword: Joi.string().min(6).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});

export function validatePasswordUpdate(req, res, next) {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({ error: error.details.map((detail) => detail.message) });
  }

  next();
}
