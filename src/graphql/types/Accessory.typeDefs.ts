import { gql } from 'apollo-server-express';

const schema = gql`
input AccReq {
  name: String
  id: String
  company: String
  forPlatforms: [String]
  forClones: [String]
  image: String
  type: String
  notes: String
  pricePaid: Float
  purchaseDate: String
  howAcquired: String
  officialLicensed: Boolean
}
type Acc {
  name: String
  _id: String
  company: String
  forPlatforms: [UserPlatform]
  forClones: [Clone]
  image: String
  type: String
  notes: String
  pricePaid: Float
  purchaseDate: String
  howAcquired: String
  officialLicensed: Boolean
  wishlist: Boolean
  created: String
  updated: String
}
extend type Query {
  userAcc(id: String, wl: Boolean, platform: String, clone: String): [Acc]
}
extend type Mutation {
  addAcc(acc: AccReq!): Acc
  editAcc(acc: AccReq!): Acc
  deleteAcc(id: String!): Int
}
`;

export default schema;