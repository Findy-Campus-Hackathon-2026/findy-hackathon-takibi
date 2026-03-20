Rails.application.routes.draw do
  mount ActionCable.server => "/cable"

  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
