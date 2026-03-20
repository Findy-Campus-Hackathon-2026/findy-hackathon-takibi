class BonfireChannel < ApplicationCable::Channel
  def subscribed
    stream_from "bonfire"

    # 接続した瞬間に、現在焚き火にいる全ユーザー一覧を送る（まだ参加していなくても視覚的に見えるように）
    # 本人IDは nil で送る（join後に正式なIDが付与される）
    manager = BonfireSessionManager.instance
    transmit({ type: "welcome", userId: nil, users: manager.all_users })
    transmit({ type: "count_update", count: manager.count })
  end


  def unsubscribed
    leave
  end

  def join(data)
    name = (data["name"] || data[:name]).presence
    manager = BonfireSessionManager.instance
    user_data = manager.add_user(anonymous_id, name: name)

    # Send welcome to the joining user
    transmit({ type: "welcome", userId: anonymous_id, users: manager.all_users })

    # Broadcast new user to everyone else
    ActionCable.server.broadcast("bonfire", { type: "user_joined", user: user_data })
    ActionCable.server.broadcast("bonfire", { type: "count_update", count: manager.count })
  end

  def update_profile(data)
    manager = BonfireSessionManager.instance
    attrs = {
      name: (data["name"] || data[:name]).presence,
      skinColor: (data["skinColor"] || data[:skinColor]).presence,
      hairColor: (data["hairColor"] || data[:hairColor]).presence,
      avatarColor: (data["avatarColor"] || data[:avatarColor]).presence
    }.compact

    updated = manager.update_user(anonymous_id, attrs)
    return unless updated

    ActionCable.server.broadcast("bonfire", { type: "user_updated", user: updated })
  end

  def chat(data)
    manager = BonfireSessionManager.instance
    user = manager.user(anonymous_id)
    return unless user

    body = (data["body"] || data[:body]).to_s.strip
    return if body.empty? || body.length > 200

    message = {
      id: SecureRandom.uuid,
      userId: anonymous_id,
      userName: user[:name],
      avatarColor: user[:avatarColor],
      body: body,
      timestamp: (Time.current.to_f * 1000).to_i
    }

    ActionCable.server.broadcast("bonfire", { type: "chat", message: message })
  end

  def leave(_data = {})
    manager = BonfireSessionManager.instance
    manager.remove_user(anonymous_id)

    ActionCable.server.broadcast("bonfire", { type: "user_left", userId: anonymous_id })
    ActionCable.server.broadcast("bonfire", { type: "count_update", count: manager.count })
  end
end
