import { getCallbackFunc, sendGetRequest, sendPostRequest } from './utils';
import { SERVER_URL } from '../../config';

const URL_GET_CUBEGON_INFO = `${SERVER_URL}/api/cubego/get_data`;
const URL_REGISTER_CUBEGON = `${SERVER_URL}/api/cubego/register`;
const URL_RETRY_REGISTER_CUBEGON = `${SERVER_URL}/api/cubego/register_retry`;
const URL_UPDATE_NAME = `${SERVER_URL}/api/cubego/update_name`;
const URL_GET_CUBEGON_LIST = `${SERVER_URL}/api/cubego/get_list`;

const GetCubegonInfo = (id, tokenId) => new Promise((resolve, reject) => {
  sendGetRequest({
    url: URL_GET_CUBEGON_INFO + (id ? `?id=${id}` : `?token_id=${tokenId}`),
    resolve,
    reject,
  });
});

const RegisterCubegon = ({
  address, structure, name, energy_limit, image, timestamp, signature,
}) => new Promise((resolve, reject) => {
  sendPostRequest({
    url: URL_REGISTER_CUBEGON,
    data: {
      trainer_address: address,
      structure,
      name,
      energy_limit,
      image,
      timestamp,
      signature,
    },
    resolve,
    reject,
  });
});

const RetryRegisterCubegon = ({ gonId }) => new Promise((resolve, reject) => {
  sendPostRequest({
    url: URL_RETRY_REGISTER_CUBEGON,
    data: {
      id: gonId,
    },
    resolve,
    reject,
  });
});

const UpdateCubegonName = ({ id, name, signature }) => new Promise((resolve, reject) => {
  sendPostRequest({
    url: URL_UPDATE_NAME,
    data: {
      id,
      name,
      signature,
    },
    resolve,
    reject,
  });
});

const GetCubegonList = () => new Promise((resolve, reject) => {
  sendGetRequest({
    url: URL_GET_CUBEGON_LIST,
    resolve,
    reject,
  });
});

const CheckEligibleToClaim = (userId) => new Promise((resolve, reject) => {
  window.getClaimStatus(userId, getCallbackFunc(resolve, reject));
});

const GetClaimedCount = () => new Promise((resolve, reject) => {
  window.getClaimedCount(getCallbackFunc(resolve, reject));
});

export const CubegonApi = {
  GetCubegonInfo,
  RegisterCubegon,
  RetryRegisterCubegon,
  UpdateCubegonName,
  GetCubegonList,
  CheckEligibleToClaim,
  GetClaimedCount,
};
