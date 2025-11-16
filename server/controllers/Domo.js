const models = require('../models');

const { Domo } = models;

const makerPage = async (req, res) => res.render('app');

const makeDomo = async (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.height) {
    return res.status(400).json({ error: 'name age & height are all required' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    height: req.body.height,
    x: req.body.x,
    y: req.body.y,
    owner: req.session.account._id,
  };
  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.status(201).json({
      name: newDomo.name,
      age: newDomo.age,
      height: newDomo.height,
      x: newDomo.x,
      y: newDomo.y,
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'domo already exists' });
    }
    return res.status(500).json({ error: 'error occured making domo' });
  }
};

const getDomos = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Domo.find(query).select('name age height x y').lean().exec();

    return res.json({ domos: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'error retrieving domos' });
  }
};

module.exports = {
  makerPage,
  makeDomo,
  getDomos,
};
