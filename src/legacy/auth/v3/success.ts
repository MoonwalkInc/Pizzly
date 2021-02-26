import { Response } from 'express'
import { AuthSuccessRequest } from './types'
import { asyncMiddleware } from '../../../legacy/errorHandler'
import { updateAuth, TOAuthPayload } from '../clients/integrations'

export const authSuccess = asyncMiddleware(async (req: AuthSuccessRequest, res: Response) => {
  console.log('authSuccess!')
  const { connectParams, setupId, authId, credentials, store, configuration } = req
  console.log({ connectParams, setupId, authId, credentials, store, configuration })
  // console.log('callback3', req.query)
  // let redirectBaseUrl = ''
  // switch (req.query.env) {
  //   case 'local':
  //     redirectBaseUrl = 'http://localhost:3400'
  //     break
  //   case 'develop':
  //     redirectBaseUrl = 'https://dashboard-dev.moonwalk.com'
  //     break
  //   case 'demo':
  //     redirectBaseUrl = 'https://dashboard-demo.moonwalk.com'
  //     break
  //   default:
  //     redirectBaseUrl = 'https://dashboard.moonwalk.com'
  //     break
  // }

  const buid = req.buid!
  let redirectUrl = `${process.env.CLIENT_DASHBOARD_URL}/integrations?authId=${authId}&integration=${buid}`
  // if (buid) {
  //   redirectUrl += ""
  // }

  const payload: TOAuthPayload = {
    connectParams,
    setupId,
    serviceName: buid,
    userId: authId,
    updatedAt: Date.now(),
    ...credentials
  }

  if (configuration && configuration.scopes) {
    console.log('[authSuccess] scopes', configuration.scopes)
    payload.scopes = configuration.scopes
  }

  if (req.tokenResponse) {
    payload.tokenResponseJSON = JSON.stringify(req.tokenResponse)
  }

  if (req.isCallback) {
    payload.callbackParamsJSON = JSON.stringify(req.query)
  }

  const params = {
    buid,
    authId,
    setupId,
    payload
  }

  await updateAuth({ ...params, store })

  // tg removed
  // res.header('Content-Type', 'text/html')
  // res.render('auth/callback', { authId, error: '', error_description: '', integrationUuid: buid })
  console.log({ redirectUrl })
  console.log({ authId, error: '', error_description: '', integrationUuid: buid })
  res.redirect(redirectUrl)
})
