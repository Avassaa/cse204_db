"""initial migration

Revision ID: 0001
Revises:
Create Date: 2023-05-21

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # First, drop existing foreign key constraint
    op.drop_constraint('playlist_songs_ibfk_2', 'playlist_songs', type_='foreignkey')

    # Re-add with ON DELETE CASCADE
    op.create_foreign_key(
        'playlist_songs_ibfk_2',
        'playlist_songs', 'songs',
        ['songID'], ['songID'],
        ondelete='CASCADE'
    )


def downgrade():
    # Remove CASCADE constraint
    op.drop_constraint('playlist_songs_ibfk_2', 'playlist_songs', type_='foreignkey')

    # Re-add without CASCADE
    op.create_foreign_key(
        'playlist_songs_ibfk_2',
        'playlist_songs', 'songs',
        ['songID'], ['songID']
    )
