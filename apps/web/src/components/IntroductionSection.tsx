export function IntroductionSection() {
  return (
    <section
      style={{
        background: 'white',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative sage blob */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-80px',
          width: '280px',
          height: '320px',
          background: 'rgba(181, 191, 160, 0.35)',
          borderRadius: '50% 60% 40% 70% / 60% 40% 70% 50%',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 60px',
          display: 'flex',
          gap: '60px',
          alignItems: 'flex-start',
        }}
      >
        {/* Left column 40% */}
        <div style={{ flex: '0 0 40%' }}>
          <h2
            style={{
              fontFamily: 'var(--font-alegreya), Alegreya, serif',
              fontSize: '42px',
              fontWeight: 400,
              color: '#a55e3f',
              textTransform: 'uppercase',
              letterSpacing: '5px',
              lineHeight: 1.2,
              marginBottom: '24px',
            }}
          >
            WITH HOME IN MIND
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-alegreya), Alegreya, serif',
              fontSize: '16px',
              fontStyle: 'italic',
              color: '#a55e3f',
              lineHeight: 1.8,
            }}
          >
            Lorem ipsum dolor sit amet a con sectet adipisicing elit se do eiuso tempor or incidi
            unt en labore et dolore magna aliqua ut enim minim veniam quis nost exercitation sen
            sene ullamco aboris nisi ut
          </p>
        </div>

        {/* Right area 60% */}
        <div style={{ flex: 1, display: 'flex', gap: '40px' }}>
          {/* Sub-column 1: New Ideas */}
          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontFamily: 'var(--font-alegreya), Alegreya, serif',
                fontSize: '19px',
                fontWeight: 400,
                color: '#a55e3f',
                textTransform: 'uppercase',
                letterSpacing: '3.135px',
                marginBottom: '16px',
              }}
            >
              NEW IDEAS
            </h4>
            <p
              style={{
                fontFamily: 'var(--font-lato), Lato, sans-serif',
                fontSize: '15px',
                fontWeight: 300,
                color: '#58595b',
                lineHeight: 1.7,
                marginBottom: '20px',
              }}
            >
              Lorem ipsum dolor sit amet a con sectet adipisicing elit se do eiuso tempor incidid
              unt ut labore et dolore
            </p>
            <a
              href="#"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                fontFamily: 'var(--font-lato), Lato, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#58595b',
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '1px',
                  background: '#a55e3f',
                }}
              />
              VIEW MORE
            </a>
          </div>

          {/* Sub-column 2: Creative Spirit */}
          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontFamily: 'var(--font-alegreya), Alegreya, serif',
                fontSize: '19px',
                fontWeight: 400,
                color: '#a55e3f',
                textTransform: 'uppercase',
                letterSpacing: '3.135px',
                marginBottom: '16px',
              }}
            >
              CREATIVE SPIRIT
            </h4>
            <p
              style={{
                fontFamily: 'var(--font-lato), Lato, sans-serif',
                fontSize: '15px',
                fontWeight: 300,
                color: '#58595b',
                lineHeight: 1.7,
                marginBottom: '20px',
              }}
            >
              Lorem ipsum dolor sit amet a con sectet adipisicing elit se do eiuso tempor incidid
              unt ut labore et dolore
            </p>
            <a
              href="#"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                fontFamily: 'var(--font-lato), Lato, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#58595b',
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '1px',
                  background: '#a55e3f',
                }}
              />
              VIEW MORE
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
