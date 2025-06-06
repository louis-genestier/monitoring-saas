/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LoginImport } from './routes/login'
import { Route as AuthenticatedImport } from './routes/_authenticated'
import { Route as AuthenticatedIndexImport } from './routes/_authenticated/index'
import { Route as AuthenticatedWebsitesImport } from './routes/_authenticated/websites'
import { Route as AuthenticatedProductsImport } from './routes/_authenticated/products'
import { Route as AuthenticatedInvitationsImport } from './routes/_authenticated/invitations'

// Create/Update Routes

const LoginRoute = LoginImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const AuthenticatedRoute = AuthenticatedImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRoute,
} as any)

const AuthenticatedIndexRoute = AuthenticatedIndexImport.update({
  path: '/',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedWebsitesRoute = AuthenticatedWebsitesImport.update({
  path: '/websites',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedProductsRoute = AuthenticatedProductsImport.update({
  path: '/products',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedInvitationsRoute = AuthenticatedInvitationsImport.update({
  path: '/invitations',
  getParentRoute: () => AuthenticatedRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_authenticated': {
      id: '/_authenticated'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthenticatedImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated/invitations': {
      id: '/_authenticated/invitations'
      path: '/invitations'
      fullPath: '/invitations'
      preLoaderRoute: typeof AuthenticatedInvitationsImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/products': {
      id: '/_authenticated/products'
      path: '/products'
      fullPath: '/products'
      preLoaderRoute: typeof AuthenticatedProductsImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/websites': {
      id: '/_authenticated/websites'
      path: '/websites'
      fullPath: '/websites'
      preLoaderRoute: typeof AuthenticatedWebsitesImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/': {
      id: '/_authenticated/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof AuthenticatedIndexImport
      parentRoute: typeof AuthenticatedImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  AuthenticatedRoute: AuthenticatedRoute.addChildren({
    AuthenticatedInvitationsRoute,
    AuthenticatedProductsRoute,
    AuthenticatedWebsitesRoute,
    AuthenticatedIndexRoute,
  }),
  LoginRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_authenticated",
        "/login"
      ]
    },
    "/_authenticated": {
      "filePath": "_authenticated.tsx",
      "children": [
        "/_authenticated/invitations",
        "/_authenticated/products",
        "/_authenticated/websites",
        "/_authenticated/"
      ]
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/_authenticated/invitations": {
      "filePath": "_authenticated/invitations.ts",
      "parent": "/_authenticated"
    },
    "/_authenticated/products": {
      "filePath": "_authenticated/products.ts",
      "parent": "/_authenticated"
    },
    "/_authenticated/websites": {
      "filePath": "_authenticated/websites.ts",
      "parent": "/_authenticated"
    },
    "/_authenticated/": {
      "filePath": "_authenticated/index.ts",
      "parent": "/_authenticated"
    }
  }
}
ROUTE_MANIFEST_END */
