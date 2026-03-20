require "concurrent"

class BonfireSessionManager
  AVATAR_EMOJIS = %w[🧑 👩 👨 🧔 👧 🧒 🧕 🧑‍💻 👩‍💻 👨‍🍳].freeze
  AVATAR_COLORS = %w[#FF6B6B #FFD93D #6BCB77 #4D96FF #C77DFF #FF9A3C #00C9A7 #F72585].freeze
  ANONYMOUS_NAMES = %w[
    たびびと かくれんぼ ほたる かぜ つき
    ほし もり かわ やま そら
    うみ はな ゆき あめ くも
  ].freeze

  MIN_RADIUS = 115
  MAX_RADIUS = 140

  class << self
    def instance
      @instance ||= new
    end
  end

  def initialize
    @users = Concurrent::Map.new
  end

  def add_user(user_id, name: nil)
    user_data = {
      id: user_id,
      name: name || ANONYMOUS_NAMES.sample,
      avatarColor: AVATAR_COLORS.sample,
      avatarEmoji: AVATAR_EMOJIS.sample,
      avatarImageUrl: nil,
      joinedAt: (Time.current.to_f * 1000).to_i
    }
    @users[user_id] = user_data
    recalculate_positions!
    @users[user_id]
  end

  def remove_user(user_id)
    @users.delete(user_id)
    recalculate_positions!
  end

  def user(user_id)
    @users[user_id]
  end

  def all_users
    @users.values
  end

  def count
    @users.size
  end

  def clear!
    @users = Concurrent::Map.new
  end

  private

  def recalculate_positions!
    users = @users.keys
    total = users.size
    return if total.zero?

    users.each_with_index do |uid, index|
      data = @users[uid]
      next unless data

      angle = (360.0 / total) * index
      radius = rand(MIN_RADIUS..MAX_RADIUS)
      @users[uid] = data.merge(angle: angle, radius: radius)
    end
  end
end
