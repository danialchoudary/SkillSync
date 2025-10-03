import Joi from 'joi';

const experienceSchema = Joi.object({
  years: Joi.number().integer().min(0).max(50).required(),
  summary: Joi.string().max(500).allow(''),
});

const schema = Joi.object({
  name: Joi.string().min(2).max(60),
  skills: Joi.array().items(Joi.string().min(1).max(30)).max(25),
  experience: experienceSchema,
  companyName: Joi.string().min(2).max(100),
  companyAddress: Joi.string().min(2).max(200),
  companyWebsite: Joi.string().uri().allow(''),
  companyLogo: Joi.string().allow(''),
  industry: Joi.string().min(2).max(50).allow(''),
  location: Joi.string().min(2).max(100).allow(''),
  description: Joi.string().max(1000).allow(''),
});

export function validateUserUpdate(req, res, next) {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error: error.details.map(d => d.message) });
  }
  next();
}
