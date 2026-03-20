require "rails_helper"

RSpec.describe BonfireSessionManager do
  let(:manager) { described_class.new }

  after { manager.clear! }

  describe "#add_user" do
    it "adds a user with generated attributes" do
      user = manager.add_user("user-1")

      expect(user[:id]).to eq("user-1")
      expect(user[:name]).to be_present
      expect(user[:avatarColor]).to be_present
      expect(user[:avatarEmoji]).to be_present
      expect(user[:joinedAt]).to be_a(Integer)
      expect(user[:angle]).to be_a(Float).or be_a(Integer)
      expect(user[:radius]).to be_between(115, 140)
    end

    it "uses the provided name" do
      user = manager.add_user("user-1", name: "テスト太郎")
      expect(user[:name]).to eq("テスト太郎")
    end

    it "assigns an anonymous name when none is given" do
      user = manager.add_user("user-1")
      expect(BonfireSessionManager::ANONYMOUS_NAMES).to include(user[:name])
    end

    it "assigns avatar color from AVATAR_COLORS" do
      user = manager.add_user("user-1")
      expect(BonfireSessionManager::AVATAR_COLORS).to include(user[:avatarColor])
    end

    it "assigns avatar emoji from AVATAR_EMOJIS" do
      user = manager.add_user("user-1")
      expect(BonfireSessionManager::AVATAR_EMOJIS).to include(user[:avatarEmoji])
    end
  end

  describe "#remove_user" do
    it "removes the user" do
      manager.add_user("user-1")
      manager.remove_user("user-1")

      expect(manager.user("user-1")).to be_nil
      expect(manager.count).to eq(0)
    end
  end

  describe "#all_users" do
    it "returns all current users" do
      manager.add_user("user-1")
      manager.add_user("user-2")

      expect(manager.all_users.size).to eq(2)
    end
  end

  describe "#count" do
    it "returns the number of users" do
      expect(manager.count).to eq(0)
      manager.add_user("user-1")
      expect(manager.count).to eq(1)
    end
  end

  describe "position calculation" do
    it "distributes users evenly around 360 degrees" do
      manager.add_user("user-1")
      manager.add_user("user-2")
      manager.add_user("user-3")

      users = manager.all_users
      angles = users.map { |u| u[:angle] }.sort

      expect(angles).to eq([0.0, 120.0, 240.0])
    end

    it "recalculates positions when users change" do
      manager.add_user("user-1")
      manager.add_user("user-2")

      angles_before = manager.all_users.map { |u| u[:angle] }.sort
      expect(angles_before).to eq([0.0, 180.0])

      manager.add_user("user-3")

      angles_after = manager.all_users.map { |u| u[:angle] }.sort
      expect(angles_after).to eq([0.0, 120.0, 240.0])
    end
  end
end
