import * as core from '@actions/core'
import Axios, {AxiosInstance} from 'axios'
import {Client} from '@elastic/elasticsearch'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function sendRequestToGithub(client: AxiosInstance, path: string) {
  try {
    const response = await client.get(path)
    core.debug(response.data)
    return response.data
  } catch (e) {
    throw new Error(`Cannot send request to Github : ${e}`)
  }
}

export interface ElasticMessageFormat {
  conclusion: string
  metadata: {}
  name: string
  details: {}
  id: number
  steps: string
  logs: string
  status: string
}

export async function sendMessagesToElastic(
  client: Client,
  messages: ElasticMessageFormat,
  elasticIndex: string
): Promise<void> {
  try {
    core.debug(`Push to elasticIndex`)
    client.index({body: messages, index: elasticIndex})
  } catch (e) {
    throw new Error(`Cannot send request to Elastic : ${e}`)
  }
}

export function createAxiosGithubInstance(token: string): AxiosInstance {
  return Axios.create({
    baseURL: 'https://git.i.mercedes-benz.com/api/v3',
    timeout: 1000,
    headers: {Authorization: `token ${token}`}
  })
}

export function createElasticInstance(
  elasticUrl: string,
  elasticApiKeyId: string,
  elasticApiKey: string,
  elasticCloudId: string,
  elasticCloudUser: string,
  elasticCloudPassword: string
): Client {
  return !elasticCloudId
    ? new Client({
        node: elasticUrl,
        auth: {
          apiKey: {
            id: elasticApiKeyId,
            api_key: elasticApiKey
          }
        }
      })
    : new Client({
        node: elasticUrl,
        cloud: {id: elasticCloudId},
        auth: {
          username: elasticCloudUser,
          password: elasticCloudPassword
        }
      })
}
