'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">game-sage documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AdminComponent.html" data-type="entity-link" >AdminComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AIChatComponent.html" data-type="entity-link" >AIChatComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CarouselComponent.html" data-type="entity-link" >CarouselComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CartComponent.html" data-type="entity-link" >CartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ConditionsComponent.html" data-type="entity-link" >ConditionsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ContactComponent.html" data-type="entity-link" >ContactComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CookiesComponent.html" data-type="entity-link" >CookiesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardComponent.html" data-type="entity-link" >DashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DeveloperFormComponent.html" data-type="entity-link" >DeveloperFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DeveloperListComponent.html" data-type="entity-link" >DeveloperListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ErrorToastComponent.html" data-type="entity-link" >ErrorToastComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FavouritesComponent.html" data-type="entity-link" >FavouritesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FileUploadComponent.html" data-type="entity-link" >FileUploadComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FooterComponent.html" data-type="entity-link" >FooterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GameCardComponent.html" data-type="entity-link" >GameCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GameFormComponent.html" data-type="entity-link" >GameFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GameListComponent.html" data-type="entity-link" >GameListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GenreFormComponent.html" data-type="entity-link" >GenreFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GenreListComponent.html" data-type="entity-link" >GenreListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HelpComponent.html" data-type="entity-link" >HelpComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HomeComponent.html" data-type="entity-link" >HomeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LanguageSelectorComponent.html" data-type="entity-link" >LanguageSelectorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoadingComponent.html" data-type="entity-link" >LoadingComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PlatformFormComponent.html" data-type="entity-link" >PlatformFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PlatformListComponent.html" data-type="entity-link" >PlatformListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PrivacyComponent.html" data-type="entity-link" >PrivacyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductComponent.html" data-type="entity-link" >ProductComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PublisherFormComponent.html" data-type="entity-link" >PublisherFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PublisherListComponent.html" data-type="entity-link" >PublisherListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RegisterComponent.html" data-type="entity-link" >RegisterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SearchComponent.html" data-type="entity-link" >SearchComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SettingsComponent.html" data-type="entity-link" >SettingsComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/CopyOnClickDirective.html" data-type="entity-link" >CopyOnClickDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/HighlightDirective.html" data-type="entity-link" >HighlightDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/BaseMediaService.html" data-type="entity-link" >BaseMediaService</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/BaseAuthenticationService.html" data-type="entity-link" >BaseAuthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BaseRepositoryHttpService.html" data-type="entity-link" >BaseRepositoryHttpService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BaseRepositoryLocalStorageService.html" data-type="entity-link" >BaseRepositoryLocalStorageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BaseService.html" data-type="entity-link" >BaseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CartItemMappingNodeService.html" data-type="entity-link" >CartItemMappingNodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CartItemService.html" data-type="entity-link" >CartItemService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChatMappingNodeService.html" data-type="entity-link" >ChatMappingNodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChatService.html" data-type="entity-link" >ChatService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DeveloperMappingNodeService.html" data-type="entity-link" >DeveloperMappingNodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DeveloperService.html" data-type="entity-link" >DeveloperService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ErrorService.html" data-type="entity-link" >ErrorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FavoriteMappingNodeService.html" data-type="entity-link" >FavoriteMappingNodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FavoriteService.html" data-type="entity-link" >FavoriteService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GameMappingNodeService.html" data-type="entity-link" >GameMappingNodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GameService.html" data-type="entity-link" >GameService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GenreMappingNodeService.html" data-type="entity-link" >GenreMappingNodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GenreService.html" data-type="entity-link" >GenreService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LanguageService.html" data-type="entity-link" >LanguageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MediaMappingNodeService.html" data-type="entity-link" >MediaMappingNodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MediaRepositoryHttpService.html" data-type="entity-link" >MediaRepositoryHttpService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MediaService.html" data-type="entity-link" >MediaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NodeAuthenticationService.html" data-type="entity-link" >NodeAuthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NodeAuthMappingService.html" data-type="entity-link" >NodeAuthMappingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NodeRepositoryService.html" data-type="entity-link" >NodeRepositoryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PlatformMappingNodeService.html" data-type="entity-link" >PlatformMappingNodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PlatformService.html" data-type="entity-link" >PlatformService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PublisherMappingNodeService.html" data-type="entity-link" >PublisherMappingNodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PublisherService.html" data-type="entity-link" >PublisherService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PurchaseItemMappingNodeService.html" data-type="entity-link" >PurchaseItemMappingNodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PurchaseItemService.html" data-type="entity-link" >PurchaseItemService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PurchaseMappingNodeService.html" data-type="entity-link" >PurchaseMappingNodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PurchaseService.html" data-type="entity-link" >PurchaseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UiStateService.html" data-type="entity-link" >UiStateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserMappingNodeService.html" data-type="entity-link" >UserMappingNodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link" >UserService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AppError.html" data-type="entity-link" >AppError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartItem.html" data-type="entity-link" >CartItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChatMessage.html" data-type="entity-link" >ChatMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChatResponse.html" data-type="entity-link" >ChatResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChatSession.html" data-type="entity-link" >ChatSession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Developer.html" data-type="entity-link" >Developer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Favorite.html" data-type="entity-link" >Favorite</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilterOption.html" data-type="entity-link" >FilterOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Game.html" data-type="entity-link" >Game</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GameResult.html" data-type="entity-link" >GameResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GameResult-1.html" data-type="entity-link" >GameResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Genre.html" data-type="entity-link" >Genre</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAuthentication.html" data-type="entity-link" >IAuthentication</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAuthMapping.html" data-type="entity-link" >IAuthMapping</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBaseMapping.html" data-type="entity-link" >IBaseMapping</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBaseRepository.html" data-type="entity-link" >IBaseRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBaseService.html" data-type="entity-link" >IBaseService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICartItemRepository.html" data-type="entity-link" >ICartItemRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICartItemService.html" data-type="entity-link" >ICartItemService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IChatRepository.html" data-type="entity-link" >IChatRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IChatService.html" data-type="entity-link" >IChatService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDeveloperRepository.html" data-type="entity-link" >IDeveloperRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDeveloperService.html" data-type="entity-link" >IDeveloperService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFavoriteRepository.html" data-type="entity-link" >IFavoriteRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFavoriteService.html" data-type="entity-link" >IFavoriteService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IGameRepository.html" data-type="entity-link" >IGameRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IGameService.html" data-type="entity-link" >IGameService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IGenreRepository.html" data-type="entity-link" >IGenreRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IGenreService.html" data-type="entity-link" >IGenreService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMediaRepository.html" data-type="entity-link" >IMediaRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMediaService.html" data-type="entity-link" >IMediaService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPlatformRepository.html" data-type="entity-link" >IPlatformRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPlatformService.html" data-type="entity-link" >IPlatformService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPublisherRepository.html" data-type="entity-link" >IPublisherRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPublisherService.html" data-type="entity-link" >IPublisherService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPurchaseItemRepository.html" data-type="entity-link" >IPurchaseItemRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPurchaseItemService.html" data-type="entity-link" >IPurchaseItemService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPurchaseRepository.html" data-type="entity-link" >IPurchaseRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPurchaseService.html" data-type="entity-link" >IPurchaseService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserRepository.html" data-type="entity-link" >IUserRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserService.html" data-type="entity-link" >IUserService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Media.html" data-type="entity-link" >Media</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MediaItem.html" data-type="entity-link" >MediaItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Model.html" data-type="entity-link" >Model</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Platform.html" data-type="entity-link" >Platform</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Publisher.html" data-type="entity-link" >Publisher</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Purchase.html" data-type="entity-link" >Purchase</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PurchaseItem.html" data-type="entity-link" >PurchaseItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Request.html" data-type="entity-link" >Request</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchParams.html" data-type="entity-link" >SearchParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendMessagePayload.html" data-type="entity-link" >SendMessagePayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SignInPayload.html" data-type="entity-link" >SignInPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SignUpPayload.html" data-type="entity-link" >SignUpPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#pipes-links"' :
                                'data-bs-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-add"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/CapitalizePipe.html" data-type="entity-link" >CapitalizePipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/MarkdownPipe.html" data-type="entity-link" >MarkdownPipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/SanitizeHtmlPipe.html" data-type="entity-link" >SanitizeHtmlPipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});