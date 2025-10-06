import { MapPin } from "lucide-react";

const MapView = () => {
  return (
    <div className="h-[500px] bg-muted rounded-lg overflow-hidden relative">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
      />
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <span className="font-medium text-sm">Nearby Restaurants</span>
      </div>
    </div>
  );
};

export default MapView;
