import { Response } from 'express'
import { AuthSuccessRequest } from './types'
import { asyncMiddleware } from '../../../legacy/errorHandler'
import { updateAuth, TOAuthPayload } from '../clients/integrations'

export const authSuccess = asyncMiddleware(async (req: AuthSuccessRequest, res: Response) => {
  console.log('authSuccess!')
  const { connectParams, setupId, authId, credentials, store, configuration } = req
  const buid = req.buid!
  const redirectUrl = `${process.env.CLIENT_DASHBOARD_URL}/integrations?authId=${authId}&integrationSuccessful=${buid}`

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
  console.log({ redirectUrl })
  console.log({ authId, error: '', error_description: '', integrationUuid: buid })

  // tg
  if (process.env.ALLOW_LOCAL_REDIRECT === 'true') {
    console.log('show local redirect screen...')
    const localRedirectUrl = `http://localhost:3400/integrations?authId=${authId}&integrationSuccessful=${buid}`
    res.header('Content-Type', 'text/html')
    res.render('auth/callback', {
      authId,
      error: '',
      error_description: '',
      integrationUuid: buid,
      redirectUrl,
      localRedirectUrl
    })
  } else {
    console.log('redirecting...')
    res.redirect(redirectUrl)
  }
})
