import spotipy
from spotipy.oauth2 import SpotifyOAuth
import datetime

sp = spotipy.Spotify()

SPOTIFY_CLIENT_ID = "cae135cb691048e6baa3b09e67958658"
SPOTIFY_CLIENT_SECRET = "76b54e8ba6aa4409bbfcf6cfbe2a29b5"
SPOTIFY_REDIRECT_URI = "http://localhost:8080"
USERNAME = input("Type in your spotify name: ")


def get_top_tracks(sp, time_range="short_term"):
    results = sp.current_user_top_tracks(time_range="short_term", limit=25)
    return [track["id"] for track in results["items"]]


def create_playlist(sp, title, track_ids):
    try:
        playlist = sp.user_playlist_create(USERNAME, title)
        sp.playlist_add_items(playlist["id"], track_ids)
    except spotipy.SpotifyException as e:
        print(f"Error creating playlist: {e}")


def main():
    scope = "user-top-read playlist-modify-public"
    sp = spotipy.Spotify(
        auth_manager=SpotifyOAuth(
            client_id=SPOTIFY_CLIENT_ID,
            client_secret=SPOTIFY_CLIENT_SECRET,
            redirect_uri=SPOTIFY_REDIRECT_URI,
            scope=scope,
        )
    )

    first_of_month = datetime.datetime.today()
    last_month = first_of_month - datetime.timedelta(days=60)

    start = int(last_month.timestamp())
    end = int(first_of_month.timestamp())

    time_range = f"{start*1000}-{end*1000}"  # Multiply by 1000 to convert seconds to milliseconds

    top_tracks = get_top_tracks(sp, time_range)

    title = f"{first_of_month:%B} Top Songs {int(first_of_month.timestamp())}"  # Unique identifier added
    create_playlist(sp, title, top_tracks)

    print(f"Created '{title}' playlist")


if __name__ == "__main__":
    main()
