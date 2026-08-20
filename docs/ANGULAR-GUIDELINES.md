# Angular 21 + PrimeNG / Sakai-ng — Architecture & Conventions

> **Fichier de contexte pour Claude Code.**
> Ces règles sont **normatives**. Tout code généré, modifié ou revu dans ce dépôt doit s'y conformer.
> En cas de conflit entre une habitude « classique Angular » et ce document, **ce document gagne**.
> Si une règle semble inapplicable dans un cas précis : **le signaler explicitement dans la réponse** au lieu de contourner silencieusement.

---

## 0. Stack de référence

| Élément | Version / choix |
|---|---|
| Angular | 21.x (standalone, **zoneless**, signals) |
| PrimeNG | 21.x + `@primeuix/themes` (preset Aura) |
| Template | sakai-ng 21.0.0 |
| CSS | Tailwind CSS v4 + `tailwindcss-primeui` + SCSS du layout Sakai |
| Build | `@angular/build:application` (esbuild) |
| Tests | Vitest (runner par défaut Angular 21) + Angular Testing Library si dispo |
| Lint / format | ESLint (flat config `eslint.config.js`) + Prettier |
| TypeScript | mode `strict` **obligatoire**, `strictTemplates: true` |

**Avant de générer du code**, vérifier les versions réelles dans `package.json` et la config réelle dans `src/app/app.config.ts`. Ne jamais supposer.

---

## 1. Architecture de dossiers

Architecture **feature-first** avec un noyau technique isolé. Une feature = une capacité métier, pas un écran.

```
src/
├── app/
│   ├── app.ts                     # composant racine (shell)
│   ├── app.config.ts              # providers applicatifs
│   ├── app.routes.ts              # routes racine (lazy uniquement)
│   │
│   ├── core/                      # SINGLETONS techniques — chargé 1 fois
│   │   ├── auth/                  # AuthService, Keycloak, token store, roles
│   │   ├── http/                  # interceptors fonctionnels
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   ├── correlation-id.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   ├── guards/                # authGuard, roleGuard, pendingChangesGuard
│   │   ├── config/                # APP_CONFIG, tokens d'injection, env runtime
│   │   ├── errors/                # GlobalErrorHandler, mapping erreurs API
│   │   ├── logging/               # LoggerService
│   │   └── providers/             # provideCore(), provideApiConfig()...
│   │
│   ├── shared/                    # RÉUTILISABLE et SANS métier
│   │   ├── ui/                    # composants présentationnels (dumb)
│   │   ├── directives/
│   │   ├── pipes/
│   │   ├── validators/
│   │   ├── models/                # types transverses (Page<T>, ApiError…)
│   │   └── utils/                 # fonctions pures
│   │
│   ├── features/                  # LE MÉTIER
│   │   └── <feature>/
│   │       ├── <feature>.routes.ts
│   │       ├── data-access/       # services HTTP, stores, mappers, DTO
│   │       │   ├── <feature>.api.ts
│   │       │   ├── <feature>.store.ts
│   │       │   ├── <feature>.mapper.ts
│   │       │   └── dto/
│   │       ├── domain/            # modèles métier + règles pures (testables)
│   │       ├── feature/           # composants routés (smart / containers)
│   │       └── ui/                # composants présentationnels de la feature
│   │
│   ├── layout/                    # ⚠️ SAKAI — voir §9. Ne pas restructurer.
│   │   ├── component/
│   │   └── service/layout.service.ts
│   │
│   └── pages/                     # pages Sakai (auth, notfound, landing…)
│
├── assets/ | public/
├── environments/
└── styles.scss
```

### Règles de dépendances (à ne jamais violer)

```
features/<A>  ──► shared, core, features/<A>/*
features/<A>  ──✗  features/<B>          (aucun import croisé)
shared        ──► shared uniquement       (jamais core, jamais features)
core          ──► shared                  (jamais features)
layout        ──► core, shared            (jamais une feature métier)
```

- Communication inter-features : **par le routeur**, par un store de `core`, ou par un contrat placé dans `shared`.
- Toute violation → refactorer, ne pas ajouter un import « juste pour cette fois ».
- Idéalement, faire respecter par ESLint (`@typescript-eslint` + `eslint-plugin-boundaries` ou `no-restricted-imports`).

### Découpage en couches d'une feature

| Couche | Rôle | Interdits |
|---|---|---|
| `domain` | Types métier, règles pures, calculs | Aucun import Angular, aucun HTTP |
| `data-access` | Appels API, cache, store, mapping DTO↔domain | Aucun template, aucun composant |
| `feature` | Composants routés, orchestration, état d'écran | Pas de logique métier complexe |
| `ui` | Présentation pure, `input()`/`output()` | Pas d'injection de service métier, pas de HTTP |

---

## 2. Conventions de nommage

Convention officielle Angular 20+/21 (celle générée par le CLI) :

| Type | Fichier | Classe |
|---|---|---|
| Composant | `user-list.ts` (+ `.html`, `.scss`) | `UserList` |
| Service | `user-service.ts` | `UserService` |
| Guard | `auth-guard.ts` | `authGuard` |
| Interceptor | `auth-interceptor.ts` | `authInterceptor` |
| Resolver | `user-resolver.ts` | `userResolver` |
| Pipe | `amount-xof-pipe.ts` | `AmountXofPipe` |
| Routes | `user.routes.ts` | `USER_ROUTES` |
| Store | `user-store.ts` | `UserStore` |

Autres règles :
- Dossiers et fichiers en **kebab-case**. Un fichier = une responsabilité exportée.
- Sélecteurs : préfixe applicatif cohérent, ex. `app-user-list` (`<prefix>-<nom>`).
- **Ne pas renommer les fichiers de `src/app/layout/**` de Sakai** (`app.topbar.ts`, `app.menu.ts`…) : conserver leur nommage d'origine facilite les mises à jour du template.
- Constantes : `SCREAMING_SNAKE_CASE`. Tokens d'injection : `MON_TOKEN`.
- Un fichier `index.ts` (barrel) **uniquement** en frontière publique de `shared/ui` — jamais dans une feature (cycles + tree-shaking dégradé).

---

## 3. Composants — règles Angular 21

### Obligatoire

```ts
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,   // TOUJOURS
  imports: [TableModule, ButtonModule, UserCard],    // standalone par défaut
  host: { class: 'block' },                          // pas de @HostBinding/@HostListener
})
export class UserList {
  private readonly store = inject(UserStore);        // inject(), pas de constructeur

  readonly userId = input.required<string>();        // signal input
  readonly pageSize = input(20);
  readonly selected = model<User | null>(null);      // two-way signal
  readonly deleted = output<string>();               // output()

  readonly users = this.store.users;                 // Signal<User[]>
  readonly total = computed(() => this.users().length);

  private readonly table = viewChild.required<Table>('dt');  // query signal
}
```

### Interdits stricts

- ❌ `NgModule` — **tout est standalone**. `standalone: true` est implicite, ne pas l'écrire.
- ❌ `@Input()` / `@Output()` décorateurs → `input()`, `input.required()`, `model()`, `output()`.
- ❌ `@ViewChild` / `@ContentChild` → `viewChild()`, `viewChildren()`, `contentChild()`.
- ❌ `@HostBinding` / `@HostListener` → objet `host` dans le décorateur.
- ❌ `*ngIf`, `*ngFor`, `*ngSwitch` → `@if`, `@for`, `@switch`, `@let`.
- ❌ `ngClass` / `ngStyle` (dépréciés) → `[class]`, `[class.x]`, `[style]`, `[style.width.px]`.
- ❌ Injection par constructeur → `inject()`.
- ❌ `any` (sauf justification en commentaire), `as unknown as`, `!` non-null assertion abusif.
- ❌ Logique dans le template au-delà d'une expression simple → `computed()`.
- ❌ Appel de méthode dans le template (`{{ getTotal() }}`) → `computed()` ou pipe pur.
- ❌ `ngDoCheck`, `AfterViewChecked` pour du calcul.
- ❌ Modification du DOM via `ElementRef.nativeElement` (sauf cas mesuré, avec commentaire).

### Templates

```html
@if (store.isLoading()) {
  <p-skeleton height="4rem" />
} @else if (store.error(); as err) {
  <p-message severity="error" [text]="err.message" />
} @else {
  @for (user of users(); track user.id) {     <!-- track OBLIGATOIRE, jamais $index sur données -->
    <app-user-card [user]="user" (deleted)="onDeleted($event)" />
  } @empty {
    <app-empty-state message="Aucun utilisateur" />
  }
}

@defer (on viewport) {                        <!-- blocs lourds : charts, éditeurs, cartes -->
  <app-revenue-chart [data]="chartData()" />
} @placeholder (minimum 200ms) {
  <p-skeleton height="20rem" />
} @loading {
  <p-progressSpinner />
}
```

- `@let` pour éviter les répétitions : `@let fullName = user().firstName + ' ' + user().lastName;`
- Découper dès que le template dépasse ~120 lignes.
- Toujours un `@empty` sur les listes et un état d'erreur explicite.

---

## 4. Réactivité : signals d'abord, RxJS quand c'est justifié

### Signals (par défaut)

- `signal()` pour l'état mutable local, `computed()` pour tout état dérivé, `linkedSignal()` pour un état dérivé mais réinscriptible.
- `effect()` **en dernier recours** : uniquement pour des effets de bord vers l'extérieur (logging, `localStorage`, API impérative tierce). **Jamais pour synchroniser deux signals** → utiliser `computed()`.
- Ne jamais `set()`/`update()` un signal à l'intérieur d'un `effect()` sans nécessité absolue.
- Exposer l'état en **lecture seule** : `readonly users = this._users.asReadonly();`
- Mise à jour immuable : `this._users.update(list => [...list, user])`.

### RxJS (cas légitimes)

Flux d'événements, debounce/throttle, websocket, retry, combinaisons complexes, annulation.

- `takeUntilDestroyed()` (`@angular/core/rxjs-interop`) sur **tout** abonnement manuel — ou mieux : `async` pipe / `toSignal()`.
- `toSignal(obs$, { initialValue })` à la frontière template.
- `toObservable(sig)` pour repasser en RxJS.
- ❌ Aucun `.subscribe()` dans un template, ni imbriqué dans un autre `.subscribe()` → `switchMap` / `concatMap` / `exhaustMap`.
- ❌ Pas de `Subject` public exposé en écriture.

### Zoneless

Le projet tourne en `provideZonelessChangeDetection()`.
- Toute mise à jour d'UI doit passer par un **signal**, un `async` pipe, ou un événement template.
- ❌ `NgZone.run()`, `ChangeDetectorRef.detectChanges()` en code applicatif.
- Un callback de librairie tierce (Chart.js, carte, SDK) qui modifie l'affichage doit écrire dans un `signal()`.

---

## 5. Gestion d'état

Échelle progressive — **choisir le niveau le plus bas qui suffit** :

1. **État local** : `signal()` dans le composant.
2. **État partagé d'une feature** : service `providedIn` la route (`providers: []` sur la route) avec signals.
3. **État applicatif transverse** : store `providedIn: 'root'` dans `core/`.
4. **NgRx SignalStore** : uniquement si entités multiples + effets complexes + besoin de devtools. Décision à documenter dans un ADR.

Patron de store standard :

```ts
@Injectable()
export class UserStore {
  private readonly api = inject(UserApi);

  private readonly _users = signal<User[]>([]);
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle');
  private readonly _error = signal<AppError | null>(null);

  readonly users = this._users.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isLoading = computed(() => this._status() === 'loading');
  readonly isEmpty = computed(() => !this.isLoading() && this._users().length === 0);

  async load(criteria: UserCriteria): Promise<void> { /* ... */ }
}
```

Règles : état **normalisé**, jamais dupliqué ; pas de données dérivées stockées ; un store ne connaît pas le routeur ni PrimeNG.

---

## 6. Couche data-access / HTTP

### Service API

```ts
@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_CONFIG).baseUrl;

  getPage(criteria: UserCriteria): Observable<Page<User>> {
    return this.http
      .get<PageDto<UserDto>>(`${this.baseUrl}/users`, { params: toHttpParams(criteria) })
      .pipe(map(dto => toUserPage(dto)));
  }
}
```

Règles :
- **Un DTO ≠ un modèle de domaine.** Toujours un `mapper` explicite (`toUser(dto)`, `toUserDto(user)`). Le backend ne dicte pas les types du front.
- URLs **jamais en dur** dans un composant : `API_CONFIG` (InjectionToken) ou `environment`.
- Aucun `HttpClient` injecté dans un composant.
- `provideHttpClient(withFetch(), withInterceptors([...]))`.
- Interceptors **fonctionnels** uniquement (`HttpInterceptorFn`), jamais de classe.
- Erreurs : normalisées en `AppError` (`code`, `message`, `httpStatus`, `correlationId`) dans `error.interceptor.ts`, jamais de `HttpErrorResponse` brut remontant à l'UI.
- `httpResource()` / `resource()` : autorisés pour la lecture simple pilotée par signals, **mais** l'API est encore jeune — l'usage doit rester cantonné à `data-access` et être encapsulé derrière un store afin de pouvoir revenir en arrière sans toucher aux composants.

### Cache & performance réseau

- Requêtes concurrentes identiques : `shareReplay({ bufferSize: 1, refCount: true })`.
- Recherche : `debounceTime(300)` + `distinctUntilChanged()` + `switchMap()`.
- Toute liste serveur est **paginée** (`Page<T> { content, totalElements, page, size }`) — pas de `findAll()` sans limite.

---

## 7. Routing

```ts
export const routes: Routes = [
  {
    path: '',
    component: AppLayout,                        // layout Sakai
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'users',
        title: 'Utilisateurs',
        canMatch: [roleGuard(['ADMIN', 'MANAGER'])],
        loadChildren: () => import('./features/users/users.routes').then(m => m.USER_ROUTES),
      },
    ],
  },
  { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: '**', loadComponent: () => import('./pages/notfound/notfound').then(m => m.Notfound) },
];
```

- **Toute feature est lazy-loadée.** Aucun import statique d'un composant routé dans `app.routes.ts`.
- `canMatch` pour l'autorisation (évite de télécharger le chunk), `canActivate` pour l'authentification.
- Guards et resolvers **fonctionnels** (`CanActivateFn`, `ResolveFn`).
- `title` sur chaque route (accessibilité + SEO interne).
- `withComponentInputBinding()` : les params de route arrivent dans des `input()` — pas d'`ActivatedRoute.snapshot` dans les composants.
- Services scopés à une feature : déclarés dans `providers` de la route parente, pas en `root`.
- Toujours un `path: '**'` et une route d'erreur.

---

## 8. Formulaires

- **Reactive Forms typés** = standard de production. `new FormGroup<UserForm>({...})` ou `NonNullableFormBuilder`.
- ❌ `FormsModule` / `ngModel` dans les formulaires métier.
- Signal Forms (Angular 21) : **expérimental** → interdit en production tant qu'un ADR ne l'a pas validé ; API encore mouvante.
- Validateurs réutilisables dans `shared/validators/`, jamais de regex dupliquée.
- Validation asynchrone via `AsyncValidatorFn` + debounce.
- Messages d'erreur centralisés (mapping `errorKey → libellé`), affichés par un composant `<app-field-error>` unique.
- Un formulaire complexe = un **composant dédié** exposant `output<T>()` en soumission, sans appel HTTP direct.
- Garde `pendingChangesGuard` sur les formulaires longs.

---

## 9. Intégration Sakai-ng / PrimeNG — règles d'or

### Ce qu'on ne touche pas

`src/app/layout/**` est du **code fourni**. Le modifier rend toute montée de version du template douloureuse.

- ✅ Autorisé : ajouter des composants dans `layout/component/` (ex. sélecteur de langue, avatar utilisateur), brancher le modèle de menu, adapter les couleurs via le preset.
- ❌ Interdit : réécrire `app.layout.ts`, `app.sidebar.ts`, `LayoutService` ; dupliquer le SCSS du layout ; y injecter de la logique métier.
- Le **menu** (`app.menu.ts`) doit lire un modèle externalisé, ex. `core/navigation/navigation.ts`, filtré par les rôles de l'utilisateur — pas un tableau codé en dur avec du métier dedans.

### Thème

- Un **seul** point de vérité : le preset dans `app.config.ts`.

```ts
const AppPreset = definePreset(Aura, {
  semantic: { primary: { /* palette de la marque */ } },
});

providePrimeNG({
  theme: {
    preset: AppPreset,
    options: {
      darkModeSelector: '.app-dark',
      cssLayer: { name: 'primeng', order: 'theme, base, primeng' },
    },
  },
});
```

- ❌ Ne jamais surcharger un composant PrimeNG avec `::ng-deep` ou `!important`. Utiliser : tokens du preset → `dt` (design tokens par composant) → `pt` (PassThrough) → en dernier recours une classe locale avec `cssLayer`.
- Dark mode : passer par `LayoutService.toggleDarkMode()` / la classe `.app-dark`. Jamais un thème parallèle maison.
- ❌ Ne pas mélanger **PrimeFlex** et Tailwind. Le projet est en **Tailwind v4** (+ `tailwindcss-primeui`).

### Composants PrimeNG

- Importer **le module précis** (`TableModule`, `ButtonModule`…), jamais un barrel global.
- `p-table` : `lazy` + `[rows]` + `(onLazyLoad)` dès que la source est serveur. Jamais charger 10 000 lignes côté client.
- Dialogs : `DialogService` / `DynamicDialog` pour les formulaires ; `ConfirmationService` pour les confirmations ; `MessageService` pour les toasts — **injectés via un service applicatif `NotificationService`** (`core/`) et non directement dispersés dans les composants.
- Un composant maison ne doit **jamais** exposer un type PrimeNG dans son API publique (`input`/`output`) : garder le découplage.

### Vérifications Angular 21 / PrimeNG 21

- PrimeNG 21 s'appuie sur les animations CSS natives : si `provideAnimationsAsync()` / `@angular/animations` subsistent, vérifier leur nécessité réelle avant de les conserver.
- Vérifier dans `package.json` que `primeng`, `@primeuix/themes` et `@angular/*` sont sur des majeures cohérentes avant tout diagnostic de bug.

---

## 10. Styles

- Tailwind v4 pour la mise en page et l'espacement ; SCSS pour les cas structurants uniquement.
- Styles de composant **encapsulés** (`ViewEncapsulation.Emulated` par défaut). ❌ `ViewEncapsulation.None`.
- Aucune couleur en dur : utiliser les variables CSS du thème PrimeNG (`--p-primary-color`, `--p-surface-*`) ou les tokens Tailwind.
- Ordre des classes utilitaires : laisser Prettier + `prettier-plugin-tailwindcss` trancher.
- `styles.scss` = global minimal (reset, imports Tailwind, layout Sakai). Tout le reste est local.
- Responsive **mobile-first**, testé aux breakpoints du layout Sakai.

---

## 11. i18n, formats, contexte régional

- Aucun texte en dur dans un template : passer par le mécanisme i18n retenu (Angular i18n / Transloco). Décision à figer dans un ADR si non encore prise.
- Locale par défaut `fr-FR` (`registerLocaleData`, `LOCALE_ID`).
- Montants : **XOF** sans décimales → `{{ amount | currency:'XOF':'symbol':'1.0-0':'fr-FR' }}`, ou un pipe `amountXof` dédié dans `shared/pipes/`.
- Dates : `DatePipe` avec formats centralisés ; **jamais** de manipulation manuelle de chaînes de dates. Les DTO transportent de l'ISO 8601, la conversion se fait dans le mapper.
- Les identifiants bancaires/normalisés (IBAN, codes BCEAO, références PI-SPI) : validation dans `shared/validators/`, formatage dans `shared/pipes/`.

---

## 12. Sécurité

- ❌ Aucun secret, clé API, mot de passe ou token dans le code, `environment.ts` compris. Configuration runtime via un `config.json` chargé au démarrage ou variables injectées au déploiement.
- Tokens : gérés par la librairie OIDC/Keycloak retenue, jamais lus/écrits à la main dans `localStorage` depuis un composant.
- `authInterceptor` : ajoute le `Authorization: Bearer`, gère le refresh, **et n'envoie le token qu'aux domaines autorisés** (liste blanche).
- 401 → redirection login ; 403 → page « accès refusé » ; ne jamais afficher la stacktrace serveur.
- ❌ `bypassSecurityTrustHtml` sans justification écrite. Pas d'`innerHTML` sur du contenu non maîtrisé.
- Le contrôle d'accès côté front est **cosmétique** : masquer un bouton ne remplace jamais un contrôle serveur. Le rappeler si un ticket suggère l'inverse.
- Ne jamais logger de donnée personnelle ou bancaire (`console.log` d'un objet client = interdit).

---

## 13. Performance

- `OnPush` partout + zoneless (déjà couvert).
- `@defer` pour : graphiques, éditeurs riches, exports, cartes, tout onglet secondaire.
- `track` sur tous les `@for`.
- `NgOptimizedImage` (`ngSrc`) pour les images statiques ; `priority` sur l'image LCP.
- Budgets dans `angular.json` : les respecter, ne pas les relever pour faire passer un build — analyser d'abord (`--stats-json` + analyseur de bundle).
- Chaque feature lazy = un chunk. Vérifier qu'aucun import ne fait fuiter une feature dans le bundle initial.
- Pas de `setInterval` de polling sans `takeUntilDestroyed` et sans backoff.

---

## 14. Tests

- Runner : **Vitest** (défaut Angular 21). Si le projet est encore sur Karma, le signaler et proposer la migration ; ne pas mélanger les deux.
- Chaque fichier de test à côté du fichier testé : `user-store.spec.ts`.
- Priorité de couverture : `domain/` (règles pures) > `data-access/` (mappers, stores) > composants smart > composants ui.
- Composants : tester le **comportement observable** (rendu, événements émis), pas les détails d'implémentation. Sélecteurs par rôle/texte plutôt que par classe CSS.
- HTTP : `provideHttpClientTesting()` + `HttpTestingController`, toujours `httpMock.verify()`.
- Signals : lire via `fixture.componentInstance.sig()` après `fixture.detectChanges()`.
- Zoneless : privilégier `await fixture.whenStable()` plutôt que `tick()`/`fakeAsync` hérités de zone.js.
- ❌ Pas de test qui ne fait qu'appeler la méthode et vérifier qu'elle ne lève pas.
- Mocks : objets typés, pas de `as any`.

---

## 15. Qualité, git, revue

- `strict: true`, `strictTemplates: true`, `noUncheckedIndexedAccess` recommandé. Aucun `// @ts-ignore` sans commentaire justificatif.
- ESLint + Prettier lancés en pre-commit (Husky + lint-staged) et en CI. Un build avec warnings de lint ne se merge pas.
- Commits : **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`, `perf:`), en anglais, à l'impératif.
- Branches : `feature/<ticket>-<slug>`, `fix/<ticket>-<slug>`.
- PR : petite (< 400 lignes modifiées si possible), description = contexte + décisions + captures si UI.
- Décisions structurantes (state manager, i18n, stratégie d'auth, adoption d'une API expérimentale) → **ADR** dans `docs/adr/NNNN-titre.md`.

---

## 16. Anti-patterns — liste de contrôle « NE JAMAIS »

1. Créer un `NgModule`.
2. Utiliser `*ngIf` / `*ngFor` / `ngClass` / `ngStyle`.
3. Injecter par constructeur au lieu de `inject()`.
4. Omettre `changeDetection: OnPush`.
5. Appeler une méthode dans un template pour calculer une valeur.
6. Utiliser `effect()` pour dériver un état → `computed()`.
7. Souscrire sans `takeUntilDestroyed()` / `async`.
8. Injecter `HttpClient` dans un composant.
9. Exposer un DTO backend directement dans l'UI.
10. Importer une feature depuis une autre feature.
11. Mettre du métier dans `shared/` ou dans `layout/`.
12. `::ng-deep` ou `!important` sur un composant PrimeNG.
13. Modifier le layout Sakai en profondeur.
14. Mélanger PrimeFlex et Tailwind.
15. Charger une table serveur sans pagination lazy.
16. Mettre un secret dans `environment.ts`.
17. Relever un budget de bundle pour faire passer la CI.
18. Laisser un `any`, un `console.log` ou un `TODO` sans ticket dans une PR.

---

## 17. Commandes

```bash
npm start                 # ng serve
npm run build             # build production
npm test                  # tests unitaires
npx ng lint
npx ng generate component features/users/feature/user-list --skip-tests=false
npx ng update             # montée de version guidée (jamais de bump manuel des @angular/*)
npx ng mcp                # serveur MCP Angular (best practices, docs, migrations)
```

---

## 18. Definition of Done

Avant de proposer une modification comme terminée, vérifier :

- [ ] `npx ng build` passe sans erreur ni nouveau warning
- [ ] `npm test` passe ; tests ajoutés pour la logique introduite
- [ ] `npx ng lint` propre, code formaté Prettier
- [ ] Aucun `any`, aucun `console.log`, aucun secret
- [ ] `OnPush` + signals sur tout nouveau composant
- [ ] Nouvelle route lazy-loadée et protégée si nécessaire
- [ ] Aucune règle de dépendance entre couches violée
- [ ] États `loading` / `error` / `empty` traités dans l'UI
- [ ] Accessibilité : labels, `aria-*`, navigation clavier, contraste
- [ ] Responsive vérifié sur mobile
- [ ] Aucune modification non justifiée de `src/app/layout/**`

---

## 19. Instructions de travail pour Claude Code

1. **Lire avant d'écrire** : inspecter `package.json`, `app.config.ts`, `app.routes.ts` et une feature existante pour reproduire les patterns du projet.
2. **Suivre l'existant** plutôt que ce document si le projet a manifestement fait un autre choix cohérent — et le signaler.
3. **Ne pas installer de dépendance** sans la proposer d'abord avec justification et alternative.
4. **Périmètre minimal** : ne pas reformater ni « améliorer » des fichiers hors du sujet de la tâche.
5. **Pas d'invention d'API** : si une signature Angular/PrimeNG est incertaine, vérifier via le serveur MCP Angular (`get_best_practices`, `search_documentation`) ou la doc, et le dire si l'incertitude persiste.
6. **Expliquer les arbitrages** en fin de réponse : ce qui a été choisi, ce qui a été écarté, ce qui reste à valider.
7. Toute nouvelle feature commence par : `<feature>.routes.ts` + squelette `domain/`, `data-access/`, `feature/`, `ui/` — même si certains dossiers restent légers.