import spotipy
from spotipy.oauth2 import SpotifyOAuth
import datetime

SPOTIFY_CLIENT_ID = "cae135cb691048e6baa3b09e67958658"
SPOTIFY_CLIENT_SECRET = "76b54e8ba6aa4409bbfcf6cfbe2a29b5"
SPOTIFY_REDIRECT_URI = "http://localhost:8080"
USERNAME = "granthendricks1"


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

    end = int(datetime.datetime.today().timestamp())  # End time is today
    start = int(
        (datetime.datetime.today() - datetime.timedelta(weeks=4)).timestamp()
    )  # Four weeks ago

    time_range = f"{start*1000}-{end*1000}"  # Multiply by 1000 to convert seconds to milliseconds

    top_tracks = get_top_tracks(sp, time_range)

    # Use the previous month's name for the playlist
    title = (
        datetime.datetime.today().replace(day=1) - datetime.timedelta(days=1)
    ).strftime("%B") + " Top Songs"
    create_playlist(sp, title, top_tracks)

    print(f"Created '{title}' playlist with time range from {start} to {end}")


if __name__ == "__main__":
    main()
