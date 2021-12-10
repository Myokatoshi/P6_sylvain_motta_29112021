const fs = require('fs');
const Thing = require('../models/Thing');

exports.likeOrDislikeSauce = (req, res, next) => {
  const likeSauce = req.body.like;
  Thing.findOne({ _id: req.params.id })
    .then(sauce => {
      if (likeSauce > 0) {
        sauce.usersLiked.push(req.auth.userId);
        sauce.likes += 1;
      } else if(likeSauce < 0) {
        sauce.usersDisliked.push(req.auth.userId);
        sauce.dislikes += 1;
      } else {
          sauce.usersLiked.forEach((userLiked, index) => {
            if(userLiked = req.auth.userId) {
              sauce.usersLiked.splice(index, 1);
              sauce.likes -= 1;
            }  
          });
          sauce.usersDisliked.forEach((userDisliked, index) => {
            if(userDisliked = req.auth.userId) {
              sauce.usersDisliked.splice(index, 1);
              sauce.dislikes -= 1;
            }  
          });
        };
      Thing.updateOne({ _id: req.params.id }, sauce)
        .then(() => res.status(200).json({ message: 'Avis bien pris en compte !'}))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));      
};

exports.createThing = (req, res, next) => {
  const thingObject = JSON.parse(req.body.sauce);
  delete thingObject._id;
  const thing = new Thing({
    ...thingObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  thing.save()
  .then(() => res.status(201).json({ message: 'Recette de sauce enregistrée !'})) 
  .catch(error => res.status(400).json({ error }));
};

exports.modifyThing = (req, res, next) => {
  const thingObject = req.file ?
    {
      ...JSON.parse(req.body.thing),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Thing.updateOne({ _id: req.params.id, userId: req.auth.userId }, { ...thingObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Recette de sauce modifiée !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteThing = (req, res, next) => {
  Thing.findOne({ _id: req.params.id })
    .then(thing => {
      if (!thing) {
        return res.status(404).json({error: new Error('Recette non trouvé !')});
      }
      if (thing.userId !== req.auth.userId) {
        return res.status(403).json({error: new Error('Requête non autorisée !')});
      }
      const filename = thing.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
      Thing.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Recette de sauce supprimée !'}))
        .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
      .then(thing => res.status(200).json(thing))
      .catch(error => res.status(404).json({ error }));
};

exports.getAllThings = (req, res, next) => {
    Thing.find()
      .then(things => res.status(200).json(things))
      .catch(error => res.status(400).json({ error }));
};
