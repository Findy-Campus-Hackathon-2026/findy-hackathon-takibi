module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :anonymous_id

    def connect
      self.anonymous_id = SecureRandom.uuid
      logger.add_tags "ActionCable", anonymous_id
    end
  end
end
