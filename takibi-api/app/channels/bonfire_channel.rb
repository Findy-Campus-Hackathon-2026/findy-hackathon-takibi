class BonfireChannel < ApplicationCable::Channel
  def subscribed
    stream_from "bonfire"
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

  def leave(_data = {})
    manager = BonfireSessionManager.instance
    manager.remove_user(anonymous_id)

    ActionCable.server.broadcast("bonfire", { type: "user_left", userId: anonymous_id })
    ActionCable.server.broadcast("bonfire", { type: "count_update", count: manager.count })
  end
end
