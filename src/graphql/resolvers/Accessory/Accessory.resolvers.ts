import { ForbiddenError, UserInputError, ApolloError } from 'apollo-server-express';
import { IContext, IGetReq, IId } from '../../globalModels/context.model';
import { Helpers } from '../../../util/helpers';
import Accessory from '../../../models/Accessory';
import { IAccessoryDocument, IAccReq } from './Accessory.model';

const logger = Helpers.apiLogger;

export class AccessoryClass {
  _queries;
  _mutations;

  constructor() {
    this._queries = {
      async userAcc(_, { id, wl, platform, clone }: IGetReq, { user }: IContext): Promise<IAccessoryDocument[]> {
        if (!user) {
          throw new ForbiddenError(Helpers.forbiddenMessage);
        }
        try {
          if (id) {
            // return 1 accessory by _id
            const acc = await Accessory.findOne({ user: user.id, _id: id }).populate('forPlatforms forClones').exec();
            return [acc];
          } else if (platform && wl !== undefined) {
            // return accessories for platform for either owned or wishlist
            const acc = await Accessory.find({ user: user.id, wishlist: wl, forPlatforms: { $in: [platform] } }).populate('forPlatforms forClones').exec();
            return acc;
          } else if (platform && wl === undefined) {
            // return all accessories for platform both owned and on wishlist
            const acc = await Accessory.find({ user: user.id, forPlatforms: { $in: [platform] } }).populate('forPlatforms forClones').exec();
            return acc;
          } else if (clone && wl !== undefined) {
            // return accessories for clone for either owned or wishlist
            const acc = await Accessory.find({ user: user.id, wishlist: wl, forClones: { $in: [clone] } }).populate('forPlatforms forClones').exec();
            return acc;
          } else if (clone && wl === undefined) {
            // return all accessories for clone both owned and on wishlist
            const acc = await Accessory.find({ user: user.id, forClones: { $in: [clone] } }).populate('forPlatforms forClones').exec();
            return acc;
          } else if (wl !== undefined) {
            // return accessories wishlist or owned
            const accs = await Accessory.find({ user: user.id, wishlist: wl }).populate('forPlatforms forClones').exec();
            return accs;
          } else {
            // return all user accessories both from wishlist and owned
            const accs = await Accessory.find({ user: user.id }).populate('forPlatforms forClones').exec();
            return accs;
          }
        } catch (err) {
          logger.write(`Accessory.queries.userAcc ERROR: ${err}`, 'error');
          throw new ApolloError(err);
        }
      }
    };

    this._mutations = {
      async addAcc(_, { acc }: IAccReq, { user }: IContext): Promise<IAccessoryDocument> {
        if (!user) {
          throw new ForbiddenError(Helpers.forbiddenMessage);
        }
        try {
          const newAcc = new Accessory(acc);
          newAcc.user = user.id;
          newAcc.createdTimestamp();
          newAcc.updatedTimestamp();
          const added = await newAcc.save();
          return added;
        } catch (err) {
          logger.write(`Accessory.mutations.addAcc ERROR: ${err}`, 'error');
          throw new ApolloError(err);
        }
      },
      async editAcc(_, { acc }: IAccReq, { user }: IContext): Promise<IAccessoryDocument> {
        if (!user) {
          throw new ForbiddenError(Helpers.forbiddenMessage);
        }
        if (!acc) {
          throw new UserInputError('You must send an Accessory to edit!');
        }
        try {
          const toEdit = await Accessory.findOne({ _id: acc.id, user: user.id });
          const editObj = toEdit.toObject();
          const keys = Object.keys(acc);
          const errorArr = [];
          keys.forEach(key => {
            if (key !== 'id' && key !== 'created' && key !== 'updated' && key !== 'user') {
              if (editObj.hasOwnProperty(key)) {
                toEdit[key] = acc[key];
              } else {
                errorArr.push(key)
              }
            }
          });
          if (errorArr.length) {
            throw new UserInputError(`No field(s) exist for argument(s): ${errorArr.join(', ')}`);
          } else {
            toEdit.updatedTimestamp();
            const saved = toEdit.save();
            return saved;
          }
        } catch (err) {
          logger.write(`Accessory.mutations.editAcc ERROR: ${err}`, 'error');
          throw new ApolloError(err);
        }
      },
      async deleteAcc(_, { id }: IId, { user }: IContext) {
        if (!user) {
          throw new ForbiddenError(Helpers.forbiddenMessage);
        }
        if (!id) {
          throw new UserInputError('You must send an Accessory ID to delete the accessory!');
        }
        try {
          const toDelete = Accessory.findOne({ user: user.id, _id: id });
          const deleted = await toDelete.remove();
          return deleted.ok;
        } catch (err) {
          logger.write(`Accessory.mutations.deleteAcc ERROR: ${err}`, 'error');
          throw new ApolloError(err);
        }
      }
    };
  }

  get queries() {
    return this._queries;
  }

  get mutations() {
    return this._mutations;
  }
}