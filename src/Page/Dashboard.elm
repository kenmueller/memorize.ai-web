port module Page.Dashboard exposing (main)

import Browser
import Html exposing (Html, node, section, article, h1, div, a, p, figure, button, label, input, div, text, img, strong, p, small, br, i, nav, span)
import Html.Attributes exposing (attribute, src, href, id, class, alt, placeholder, type_)
import Html.Events exposing (onClick)
import Page.Template as Template

port signOut : () -> Cmd msg
port signedOut : (() -> msg) -> Sub msg
port updateUser : (User -> msg) -> Sub msg
port addMyDeck : (Deck -> msg) -> Sub msg

type alias User = { name : String, uid : String }
type alias Deck =
    { id : String
    , mastered : Int
    , count : Maybe Int
    , photoUrl : Maybe String
    , name : Maybe String
    , author : Maybe String
    }

type alias Model =
    { user : Maybe User
    , myDecks : List Deck
    }

type Msg
    = UpdatedUser User
    | AddedMyDeck Deck
    | SignOut
    | SignedOut

main : Program () Model Msg
main =
    Browser.document
        { init = \_ -> (Model Nothing [], Cmd.none)
        , view = view
        , update = update
        , subscriptions = subscriptions
        }

view : Model -> Browser.Document Msg
view model =
    case model.user of
        Nothing -> viewWithoutUser model
        Just user -> viewWithUser model user

viewWithoutUser : Model -> Browser.Document Msg
viewWithoutUser model =
    { title = "Dashboard - memorize.ai"
    , body =
        Template.viewApp
            [ Template.viewSection (Just "loading") (Just "loading")
                [ h1 [] [ text "Dashboard" ]
                , img [ src "images/infinity.gif" ] []
                ]
            ]
            model.user SignOut
    }

loadingOrText : Maybe String -> Html Msg
loadingOrText textMaybe =
    Maybe.withDefault
        (i [] [ text "Loading..." ])
        (Maybe.map text textMaybe)

viewDeckThumbnail : Deck -> Html Msg
viewDeckThumbnail deck =
    div [ class "box" ]
        [ article [ class "media" ]
            [ div [ class "media-left" ]
                [ figure [ class "image is-64x64" ]
                    [ img
                        [ src (Maybe.withDefault "images/infinity.gif" deck.photoUrl)
                        , alt "Image"
                        ] []
                    ]
                ]
            , div [ class "media-content" ]
                [ div [ class "content" ]
                    [ p []
                        [ strong [] [ loadingOrText deck.name ]
                        , text " "
                        , small [] [ loadingOrText deck.author ]
                        , text " "
                        , small [] [ loadingOrText (Maybe.map String.fromInt deck.count) ]
                        ]
                    ]
                ]
            ]
        ]

viewWithUser : Model -> User -> Browser.Document Msg
viewWithUser model user =
    { title = "Dashboard for " ++ user.name ++ " - memorize.ai"
    , body =
        Template.viewApp
            [ Template.viewSection (Just "decks") (Just "decks")
                [ div [ class "tile is-ancestor" ]
                    [ div [ class "tile is-parent" ]
                        [ div [ class "tile is-child box" ]
                            [ h1 [ class "title" ]
                                [ text "My decks "
                                , a
                                    [ href "new_deck.html", class "button is-link is-rounded" ]
                                    [ text "＋" ]
                                ]
                            , div [ class "decks" ] (List.map viewDeckThumbnail model.myDecks)
                            ]
                        ]
                    , div [ class "tile is-parent is-4" ]
                        [ div [ class "tile is-child box" ]
                            [ h1 [ class "title" ] [ text "Search decks" ]
                            , div [ id "search-input" ] []
                            , div [ id "hits" ] []
                            , div [ id "pagination" ] []
                            -- , node "script" [ attribute "type" "text/html", attribute "id" "hit-template" ]
                            --     [ div [ class "hit" ]
                            --         [ p [ class "hit-name" ]
                            --             [ text "{{#helpers.highlight}}{ \"attribute\": \"firstname\" }{{/helpers.highlight}}"
                            --             , text "{{#helpers.highlight}}{ \"attribute\": \"lastname\" }{{/helpers.highlight}}"
                            --             ]
                            --         ]
                            --     ]
                            ]
                        ]
                    ]
                ]
            ]
            model.user SignOut
    }

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdatedUser user ->
            ( { model | user = Just user }, Cmd.none )
        AddedMyDeck deck ->
            ( { model | myDecks = deck :: model.myDecks }, Cmd.none )
        SignOut ->
            ( model, signOut () )
        SignedOut ->
            ( { model | user = Nothing }, Cmd.none )
            
subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ updateUser UpdatedUser
        , addMyDeck AddedMyDeck
        , signedOut (always SignedOut)
        ]
