module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},46786,(e,t,r)=>{t.exports=e.x("os",()=>require("os"))},42983,(e,t,r)=>{"use strict";var o=Object.defineProperty,a=Object.getOwnPropertyDescriptor,n=Object.getOwnPropertyNames,s=Object.prototype.hasOwnProperty,i={},l={VercelOidcTokenError:()=>p};for(var d in l)o(i,d,{get:l[d],enumerable:!0});t.exports=((e,t,r,i)=>{if(t&&"object"==typeof t||"function"==typeof t)for(let r of n(t))s.call(e,r)||void 0===r||o(e,r,{get:()=>t[r],enumerable:!(i=a(t,r))||i.enumerable});return e})(o({},"__esModule",{value:!0}),i);class p extends Error{constructor(e,t){super(e),this.name="VercelOidcTokenError",this.cause=t}toString(){return this.cause?`${this.name}: ${this.message}: ${this.cause}`:`${this.name}: ${this.message}`}}},68938,e=>{"use strict";e.i(52347),e.s([])},97040,e=>{"use strict";var t=e.i(96679),r=e.i(23371),o=e.i(32590),a=e.i(77186),n=e.i(76992),s=e.i(13806),i=e.i(46696),l=e.i(85413),d=e.i(19253),p=e.i(62194),u=e.i(62614),c=e.i(90538),f=e.i(32660),w=e.i(72712),h=e.i(52982),m=e.i(61216),v=e.i(93695);e.i(26545);var R=e.i(52641);e.i(68938);var _=e.i(52347);let x=`var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// workflows/codeModification.ts
var codeModification_exports = {};
__export(codeModification_exports, {
  codeModificationWorkflow: () => codeModificationWorkflow
});

// workflows/steps.ts
async function initializeSandbox(repoUrl) {
  return globalThis[Symbol.for("WORKFLOW_USE_STEP")]("step//workflows/steps.ts//initializeSandbox")(repoUrl);
}
__name(initializeSandbox, "initializeSandbox");
async function analyzeRepository(repoUrl, prompt, repoInfo) {
  return globalThis[Symbol.for("WORKFLOW_USE_STEP")]("step//workflows/steps.ts//analyzeRepository")(repoUrl, prompt, repoInfo);
}
__name(analyzeRepository, "analyzeRepository");
async function executeChanges(repoUrl, prompt, filesToModify) {
  return globalThis[Symbol.for("WORKFLOW_USE_STEP")]("step//workflows/steps.ts//executeChanges")(repoUrl, prompt, filesToModify);
}
__name(executeChanges, "executeChanges");
async function createPullRequest(repoUrl, branch, changes) {
  return globalThis[Symbol.for("WORKFLOW_USE_STEP")]("step//workflows/steps.ts//createPullRequest")(repoUrl, branch, changes);
}
__name(createPullRequest, "createPullRequest");
async function notifyUser(data) {
  return globalThis[Symbol.for("WORKFLOW_USE_STEP")]("step//workflows/steps.ts//notifyUser")(data);
}
__name(notifyUser, "notifyUser");

// workflows/codeModification.ts
var codeModificationWorkflow = /* @__PURE__ */ __name(async (prompt, repoUrl, userEmail) => {
  const { repoUrl: validatedRepoUrl, repoInfo } = await initializeSandbox(repoUrl);
  const { filesToModify, analysis } = await analyzeRepository(validatedRepoUrl, prompt, repoInfo);
  const { changes, branch } = await executeChanges(validatedRepoUrl, prompt, filesToModify);
  const { prUrl, prNumber } = await createPullRequest(validatedRepoUrl, branch, changes);
  if (userEmail && userEmail.trim()) {
    await notifyUser({
      email: userEmail,
      prUrl,
      changes,
      status: "completed"
    });
  }
  return {
    success: true,
    prUrl,
    prNumber,
    changes,
    analysis
  };
}, "codeModificationWorkflow");
codeModificationWorkflow.workflowId = "workflow//workflows/codeModification.ts//codeModificationWorkflow";

// virtual-entry.js
globalThis.__private_workflows = /* @__PURE__ */ new Map();
Object.values(codeModification_exports).map((item) => item?.workflowId && globalThis.__private_workflows.set(item.workflowId, item));
`,g=(0,_.workflowEntrypoint)(x);e.s(["POST",0,g],40886);var y=e.i(40886);let b=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/.well-known/workflow/v1/flow/route",pathname:"/.well-known/workflow/v1/flow",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/.well-known/workflow/v1/flow/route.js",nextConfigOutput:"",userland:y}),{workAsyncStorage:E,workUnitAsyncStorage:k,serverHooks:P}=b;function U(){return(0,o.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:k})}async function O(e,t,o){b.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let _="/.well-known/workflow/v1/flow/route";_=_.replace(/\/index$/,"")||"/";let x=await b.prepare(e,t,{srcPage:_,multiZoneDraftMode:!1});if(!x)return t.statusCode=400,t.end("Bad Request"),null==o.waitUntil||o.waitUntil.call(o,Promise.resolve()),null;let{buildId:g,params:y,nextConfig:E,parsedUrl:k,isDraftMode:P,prerenderManifest:U,routerServerContext:O,isOnDemandRevalidate:T,revalidateOnlyGenerated:S,resolvedPathname:C,clientReferenceManifest:M,serverActionsManifest:A}=x,j=(0,l.normalizeAppPath)(_),N=!!(U.dynamicRoutes[j]||U.routes[C]),q=async()=>((null==O?void 0:O.render404)?await O.render404(e,t,k,!1):t.end("This page could not be found"),null);if(N&&!P){let e=!!U.routes[C],t=U.dynamicRoutes[j];if(t&&!1===t.fallback&&!e){if(E.experimental.adapterPath)return await q();throw new v.NoFallbackError}}let I=null;!N||b.isDev||P||(I="/index"===(I=C)?"/":I);let W=!0===b.isDev||!N,H=N&&!W;A&&M&&(0,s.setReferenceManifestsSingleton)({page:_,clientReferenceManifest:M,serverActionsManifest:A,serverModuleMap:(0,i.createServerModuleMap)({serverActionsManifest:A})});let D=e.method||"GET",$=(0,n.getTracer)(),F=$.getActiveScopeSpan(),K={params:y,prerenderManifest:U,renderOpts:{experimental:{authInterrupts:!!E.experimental.authInterrupts},cacheComponents:!!E.cacheComponents,supportsDynamicResponse:W,incrementalCache:(0,a.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:E.cacheLife,waitUntil:o.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,o)=>b.onRequestError(e,t,o,O)},sharedContext:{buildId:g}},z=new d.NodeNextRequest(e),L=new d.NodeNextResponse(t),B=p.NextRequestAdapter.fromNodeNextRequest(z,(0,p.signalFromNodeResponse)(t));try{let s=async e=>b.handle(B,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=$.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=r.get("next.route");if(o){let t=`${D} ${o}`;e.setAttributes({"next.route":o,"http.route":o,"next.span_name":t}),e.updateName(t)}else e.updateName(`${D} ${_}`)}),i=!!(0,a.getRequestMeta)(e,"minimalMode"),l=async a=>{var n,l;let d=async({previousCacheEntry:r})=>{try{if(!i&&T&&S&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(a);e.fetchMetrics=K.renderOpts.fetchMetrics;let l=K.renderOpts.pendingWaitUntil;l&&o.waitUntil&&(o.waitUntil(l),l=void 0);let d=K.renderOpts.collectedTags;if(!N)return await (0,f.sendResponse)(z,L,n,K.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,w.toNodeOutgoingHttpHeaders)(n.headers);d&&(t[m.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,o=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:R.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:o}}}}catch(t){throw(null==r?void 0:r.isStale)&&await b.onRequestError(e,t,{routerKind:"App Router",routePath:_,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:T})},O),t}},p=await b.handleResponse({req:e,nextConfig:E,cacheKey:I,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:U,isRoutePPREnabled:!1,isOnDemandRevalidate:T,revalidateOnlyGenerated:S,responseGenerator:d,waitUntil:o.waitUntil,isMinimalMode:i});if(!N)return null;if((null==p||null==(n=p.value)?void 0:n.kind)!==R.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==p||null==(l=p.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});i||t.setHeader("x-nextjs-cache",T?"REVALIDATED":p.isMiss?"MISS":p.isStale?"STALE":"HIT"),P&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,w.fromNodeOutgoingHttpHeaders)(p.value.headers);return i&&N||u.delete(m.NEXT_CACHE_TAGS_HEADER),!p.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,h.getCacheControlHeader)(p.cacheControl)),await (0,f.sendResponse)(z,L,new Response(p.value.body,{headers:u,status:p.value.status||200})),null};F?await l(F):await $.withPropagatedContext(e.headers,()=>$.trace(u.BaseServerSpan.handleRequest,{spanName:`${D} ${_}`,kind:n.SpanKind.SERVER,attributes:{"http.method":D,"http.target":e.url}},l))}catch(t){if(t instanceof v.NoFallbackError||await b.onRequestError(e,t,{routerKind:"App Router",routePath:j,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:T})}),N)throw t;return await (0,f.sendResponse)(z,L,new Response(null,{status:500})),null}}e.s(["handler",()=>O,"patchFetch",()=>U,"routeModule",()=>b,"serverHooks",()=>P,"workAsyncStorage",()=>E,"workUnitAsyncStorage",()=>k],97040)},35726,e=>{e.v(e=>Promise.resolve().then(()=>e(67173)))},57054,e=>{e.v(t=>Promise.all(["server/chunks/[root-of-the-server]__67b3fcb3._.js"].map(t=>e.l(t))).then(()=>t(88816)))},23734,e=>{e.v(t=>Promise.all(["server/chunks/[root-of-the-server]__beed4b5d._.js"].map(t=>e.l(t))).then(()=>t(49274)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__2f359001._.js.map