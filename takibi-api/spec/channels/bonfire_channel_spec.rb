require "rails_helper"

RSpec.describe BonfireChannel, type: :channel do
  before do
    BonfireSessionManager.instance.clear!
    stub_connection(anonymous_id: "test-user-123")
  end

  after do
    BonfireSessionManager.instance.clear!
  end

  describe "#subscribed" do
    it "subscribes to the bonfire stream" do
      subscribe
      expect(subscription).to be_confirmed
      expect(subscription).to have_stream_from("bonfire")
    end
  end

  describe "#join" do
    before { subscribe }

    it "adds user to the session manager" do
      perform :join

      user = BonfireSessionManager.instance.user("test-user-123")
      expect(user).not_to be_nil
      expect(user[:id]).to eq("test-user-123")
    end

    it "adds user with a custom name" do
      perform :join, { "name" => "カスタム名" }

      user = BonfireSessionManager.instance.user("test-user-123")
      expect(user[:name]).to eq("カスタム名")
    end

    it "transmits a welcome message to the joining user" do
      perform :join

      welcome = transmissions.find { |t| t["type"] == "welcome" }
      expect(welcome).to be_present
      expect(welcome["userId"]).to eq("test-user-123")
      expect(welcome["users"]).to be_an(Array)
    end

    it "broadcasts user_joined" do
      expect {
        perform :join
      }.to have_broadcasted_to("bonfire").with(hash_including(type: "user_joined"))
    end

    it "broadcasts count_update" do
      expect {
        perform :join
      }.to have_broadcasted_to("bonfire").with(hash_including(type: "count_update", count: 1))
    end
  end

  describe "#leave / #unsubscribed" do
    before do
      subscribe
      perform :join
    end

    it "removes user from session manager on leave" do
      perform :leave

      expect(BonfireSessionManager.instance.user("test-user-123")).to be_nil
    end

    it "broadcasts user_left" do
      expect {
        perform :leave
      }.to have_broadcasted_to("bonfire").with(hash_including(type: "user_left", userId: "test-user-123"))
    end

    it "broadcasts count_update with decremented count" do
      expect {
        perform :leave
      }.to have_broadcasted_to("bonfire").with(hash_including(type: "count_update", count: 0))
    end

    it "removes user on unsubscribe" do
      subscription.unsubscribe_from_channel
      expect(BonfireSessionManager.instance.user("test-user-123")).to be_nil
    end
  end
end
